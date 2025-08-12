import { gql } from '@apollo/client';
import { USER_WITH_PROFILE_FRAGMENT } from '../fragments/user';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      ...UserWithProfileFragment
    }
  }
  ${USER_WITH_PROFILE_FRAGMENT}
`;

export const VALIDATE_TOKEN = gql`
  query ValidateToken {
    validateToken {
      valid
      user {
        ...UserWithProfileFragment
      }
    }
  }
  ${USER_WITH_PROFILE_FRAGMENT}
`;