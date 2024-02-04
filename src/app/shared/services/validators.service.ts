import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({providedIn: 'root'})
export class ValidatorsService {
  public emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  // El password debe contener una letra minúscula, una mayúscula y una longitud minima de 8 caracteres
  public passwordPattern: string = "^(?=.*[a-z])(?=.*[A-Z]).{8,}$";

  isValidField( form: FormGroup, field: string ): boolean {
    return !!(form.controls[field].errors && form.controls[field].touched);
  }
}
