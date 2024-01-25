import { Pipe, PipeTransform } from "@angular/core";

export type TypeGuard<TValue, TGuardType extends TValue> = (
  value: TValue,
) => value is TGuardType;

@Pipe({
  name: "typeGuard",
  standalone: true,
})
export class TypeGuardPipe implements PipeTransform {
  transform<TValue, TGuardType extends TValue>(
    value: TValue,
    typeGuard: TypeGuard<TValue, TGuardType>,
  ): null | TGuardType {
    return typeGuard(value) ? value : null;
  }
}
