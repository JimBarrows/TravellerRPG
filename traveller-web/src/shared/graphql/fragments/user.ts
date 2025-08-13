import { gql } from '@apollo/client';

export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    username
    email
    createdAt
    updatedAt
  }
`;

export const USER_WITH_PROFILE_FRAGMENT = gql`
  fragment UserWithProfileFragment on User {
    ...UserFragment
    profile {
      id
      displayName
      bio
      avatar
    }
  }
  ${USER_FRAGMENT}
`;