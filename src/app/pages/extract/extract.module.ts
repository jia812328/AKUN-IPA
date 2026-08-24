import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { ExtractPage } from './extract.page';
import { ExtractPageRoutingModule } from './extract-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ExtractPageRoutingModule],
  declarations: [ExtractPage],
})
export class ExtractPageModule {}