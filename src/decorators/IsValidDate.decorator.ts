import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { isValidDate } from '../utils/helper/date-time.helper';

@ValidatorConstraint({ async: false })
export class IsValidDateConstraint implements ValidatorConstraintInterface {
  validate(value: any, _args: ValidationArguments) {
    return typeof value === 'string' && isValidDate(value);
  }

  defaultMessage(_args: ValidationArguments) {
    return 'Date must be valid and in the format YYYY-MM-DD';
  }
}

export const IsValidDate = (validationOptions?: ValidationOptions) => {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsValidDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidDateConstraint,
    });
  };
};
