import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface StorageStackProps extends cdk.StackProps {
  appName: string;
  environment: string;
}

export class StorageStack extends cdk.Stack {
  public readonly assetsBucket: s3.Bucket;
  public readonly backupBucket: s3.Bucket;
  public readonly userUploadsBucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    const { appName, environment } = props;

    // Create bucket for static assets (character portraits, handouts, etc.)
    this.assetsBucket = new s3.Bucket(this, 'AssetsBucket', {
      bucketName: `${appName.toLowerCase()}-${environment}-assets-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [{
        allowedMethods: [
          s3.HttpMethods.GET,
          s3.HttpMethods.HEAD,
        ],
        allowedOrigins: environment === 'prod' 
          ? ['https://app.traveller-rpg.com']
          : ['http://localhost:5173', 'http://localhost:3000'],
        allowedHeaders: ['*'],
        maxAge: 3600,
      }],
      lifecycleRules: [{
        id: 'delete-old-versions',
        noncurrentVersionExpiration: cdk.Duration.days(30),
        abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
      }],
      versioned: true,
      removalPolicy: environment === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== 'prod',
    });

    // Create bucket for user uploads (character portraits, campaign images)
    this.userUploadsBucket = new s3.Bucket(this, 'UserUploadsBucket', {
      bucketName: `${appName.toLowerCase()}-${environment}-uploads-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [{
        allowedMethods: [
          s3.HttpMethods.GET,
          s3.HttpMethods.HEAD,
          s3.HttpMethods.PUT,
          s3.HttpMethods.POST,
          s3.HttpMethods.DELETE,
        ],
        allowedOrigins: environment === 'prod'
          ? ['https://app.traveller-rpg.com']
          : ['http://localhost:5173', 'http://localhost:3000'],
        allowedHeaders: ['*'],
        exposedHeaders: ['ETag'],
        maxAge: 3600,
      }],
      lifecycleRules: [{
        id: 'transition-to-ia',
        transitions: [{
          storageClass: s3.StorageClass.INFREQUENT_ACCESS,
          transitionAfter: cdk.Duration.days(90),
        }],
        noncurrentVersionTransitions: [{
          storageClass: s3.StorageClass.INFREQUENT_ACCESS,
          transitionAfter: cdk.Duration.days(30),
        }],
        noncurrentVersionExpiration: cdk.Duration.days(90),
      }, {
        id: 'cleanup-multipart',
        abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
      }, {
        id: 'delete-temp-uploads',
        prefix: 'temp/',
        expiration: cdk.Duration.days(1),
      }],
      versioned: true,
      removalPolicy: environment === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== 'prod',
      intelligentTieringConfigurations: [{
        name: 'optimize-storage',
        prefix: 'characters/',
        archiveAccessTierTime: cdk.Duration.days(180),
        deepArchiveAccessTierTime: cdk.Duration.days(365),
      }],
    });

    // Create backup bucket for data exports and backups
    this.backupBucket = new s3.Bucket(this, 'BackupBucket', {
      bucketName: `${appName.toLowerCase()}-${environment}-backups-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      lifecycleRules: [{
        id: 'transition-old-backups',
        transitions: [{
          storageClass: s3.StorageClass.GLACIER_INSTANT_RETRIEVAL,
          transitionAfter: cdk.Duration.days(30),
        }, {
          storageClass: s3.StorageClass.GLACIER,
          transitionAfter: cdk.Duration.days(90),
        }, {
          storageClass: s3.StorageClass.DEEP_ARCHIVE,
          transitionAfter: cdk.Duration.days(365),
        }],
        expiration: cdk.Duration.days(2555), // 7 years
      }],
      versioned: false,
      removalPolicy: environment === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== 'prod',
    });

    // Create OAI for CloudFront access to S3 buckets
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: `OAI for ${appName} ${environment}`,
    });

    // Create CloudFront distribution for static assets
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `${appName} ${environment} CDN`,
      defaultBehavior: {
        origin: new origins.S3Origin(this.assetsBucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        compress: true,
      },
      additionalBehaviors: {
        '/uploads/*': {
          origin: new origins.S3Origin(this.userUploadsBucket, {
            originAccessIdentity,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: new cloudfront.CachePolicy(this, 'UploadsCachePolicy', {
            cachePolicyName: `${appName}-${environment}-uploads-cache`,
            comment: 'Cache policy for user uploads',
            defaultTtl: cdk.Duration.hours(24),
            maxTtl: cdk.Duration.days(365),
            minTtl: cdk.Duration.seconds(0),
            enableAcceptEncodingGzip: true,
            enableAcceptEncodingBrotli: true,
            queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
          }),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          compress: true,
        },
      },
      priceClass: environment === 'prod'
        ? cloudfront.PriceClass.PRICE_CLASS_100
        : cloudfront.PriceClass.PRICE_CLASS_100,
      enabled: true,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
    });

    // Grant CloudFront access to S3 buckets
    this.assetsBucket.grantRead(originAccessIdentity);
    this.userUploadsBucket.grantRead(originAccessIdentity);

    // Output bucket information
    new cdk.CfnOutput(this, 'AssetsBucketName', {
      value: this.assetsBucket.bucketName,
      description: 'Assets Bucket Name',
      exportName: `${appName}-${environment}-assets-bucket`,
    });

    new cdk.CfnOutput(this, 'AssetsBucketArn', {
      value: this.assetsBucket.bucketArn,
      description: 'Assets Bucket ARN',
      exportName: `${appName}-${environment}-assets-bucket-arn`,
    });

    new cdk.CfnOutput(this, 'UserUploadsBucketName', {
      value: this.userUploadsBucket.bucketName,
      description: 'User Uploads Bucket Name',
      exportName: `${appName}-${environment}-uploads-bucket`,
    });

    new cdk.CfnOutput(this, 'UserUploadsBucketArn', {
      value: this.userUploadsBucket.bucketArn,
      description: 'User Uploads Bucket ARN',
      exportName: `${appName}-${environment}-uploads-bucket-arn`,
    });

    new cdk.CfnOutput(this, 'BackupBucketName', {
      value: this.backupBucket.bucketName,
      description: 'Backup Bucket Name',
      exportName: `${appName}-${environment}-backup-bucket`,
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront Distribution ID',
      exportName: `${appName}-${environment}-distribution-id`,
    });

    new cdk.CfnOutput(this, 'DistributionDomain', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront Distribution Domain',
      exportName: `${appName}-${environment}-distribution-domain`,
    });
  }
}