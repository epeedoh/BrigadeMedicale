import { UserInfoDto } from './user.model';

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfoDto;
}
