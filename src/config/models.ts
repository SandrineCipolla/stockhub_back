import { IBearerStrategyOptionWithRequest } from 'passport-azure-ad';

export interface AuthConfigOptions extends IBearerStrategyOptionWithRequest {
  passwordResetPolicy?: string;
}
