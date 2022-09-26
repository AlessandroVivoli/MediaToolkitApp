import { Directive, HostBinding, Input, Optional } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Directive({
  selector: '[appLabelControl]'
})
export class LabelControlDirective {
  @Input() controlName: string;

  constructor(@Optional() private parent: ControlContainer) {}

  @HostBinding('textContent')
  get controlValue() {
    return this.parent ? this.parent.control.get(this.controlName).value : '';
  }

  set controlValue(value) {
    
  }
}
