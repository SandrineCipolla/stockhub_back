/**
 * Error thrown when family name is empty or contains only whitespace
 */
export class FamilyNameEmptyError extends Error {
  constructor() {
    super('Family name cannot be empty');
    this.name = 'FamilyNameEmptyError';
  }
}

/**
 * Error thrown when family name is too short
 */
export class FamilyNameTooShortError extends Error {
  constructor(minLength: number) {
    super(`Family name must be at least ${minLength} characters`);
    this.name = 'FamilyNameTooShortError';
  }
}

/**
 * Error thrown when family name is too long
 */
export class FamilyNameTooLongError extends Error {
  constructor(maxLength: number) {
    super(`Family name must not exceed ${maxLength} characters`);
    this.name = 'FamilyNameTooLongError';
  }
}

/**
 * Error thrown when creator user ID is invalid (0 or negative)
 */
export class InvalidCreatorUserIdError extends Error {
  constructor() {
    super('Creator user ID must be valid');
    this.name = 'InvalidCreatorUserIdError';
  }
}

/**
 * Error thrown when attempting to add a user who is already a member
 */
export class UserAlreadyMemberError extends Error {
  constructor(userId: number) {
    super(`User ${userId} is already a member of this family`);
    this.name = 'UserAlreadyMemberError';
  }
}

/**
 * Error thrown when attempting to operate on a user who is not a member
 */
export class UserNotMemberError extends Error {
  constructor(userId: number) {
    super(`User ${userId} is not a member of this family`);
    this.name = 'UserNotMemberError';
  }
}

/**
 * Error thrown when attempting to remove or demote the last admin
 */
export class LastAdminError extends Error {
  constructor(action: 'remove' | 'demote') {
    const message =
      action === 'remove'
        ? 'Cannot remove the last admin from the family'
        : 'Cannot demote the last admin';
    super(message);
    this.name = 'LastAdminError';
  }
}
