import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsEndTimeAtLeastOneHourAfter(
  startTimeProp: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEndTimeAtLeastOneHourAfter',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [startTimeProp],
      validator: {
        validate(endTime: any, args: ValidationArguments) {
          const [startTimeField] = args.constraints;
          const startTime = (args.object as any)[startTimeField];

          if (typeof startTime !== 'string' || typeof endTime !== 'string')
            return false;

          const [startH, startM] = startTime.split(':').map(Number);
          const [endH, endM] = endTime.split(':').map(Number);

          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;

          return endMinutes - startMinutes >= 60;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be at least 1 hour after ${args.constraints[0]}`;
        },
      },
    });
  };
}
