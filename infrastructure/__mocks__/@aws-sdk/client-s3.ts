export class S3Client {
  constructor(config: any) {
    // Mock constructor
  }
  
  send(command: any) {
    return Promise.resolve({});
  }
}

export class PutObjectCommand {
  input: any;
  constructor(input: any) {
    this.input = input;
  }
}

export class GetObjectCommand {
  input: any;
  constructor(input: any) {
    this.input = input;
  }
}