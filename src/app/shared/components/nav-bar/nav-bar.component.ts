import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import { SharedDataService } from '../../../services/shared-data.service';
@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [MatSelectModule, FormsModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  textPrompt: string = ''
  selectedModel: string = 'lmstudio-ai/gemma-2b-it-GGUF/gemma-2b-it-q8_0.gguf'
  constructor(private modelService: SharedDataService) {
    this.modelService.currentModel.subscribe(model => this.selectedModel = model) // selectedModel will change when currentModel change
    this.modelService.currentPrompt.subscribe(prompt => this.textPrompt = prompt)
  }

  changeModel(){
    this.modelService.updateModel(this.selectedModel)
  }

  changePrompt(){
    this.modelService.updatePrompt(this.textPrompt)
  }
}
