import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
  } from 'class-validator';
import { isTimeString } from '../utils/helper/custom-validator';
 
  
  @ValidatorConstraint({ name: 'IsTimeString', async: false })
  export class IsTimeStringConstraint implements ValidatorConstraintInterface {
    validate(value: any) {
      return typeof value === 'string' && isTimeString(value);
    }
  
    defaultMessage() {
      return 'Invalid time input';
    }
  }
  
  export function IsTimeString(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'IsTimeString',
        target: object.constructor,
        propertyName,
        options: validationOptions,
        validator: IsTimeStringConstraint,
      });
    };
  }
  