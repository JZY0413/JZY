import { simulationConfig } from './config.js';

// 获取所有的滑动条和对应的显示元素
const sliders = document.querySelectorAll('.slider');
const valueDisplays = document.querySelectorAll('.sliderValue');


sliders.forEach((slider, index) => {
    // 替换
    valueDisplays[index].textContent = slider.value; 
  
    slider.addEventListener('input', function() {
      const value = parseFloat(this.value);
      valueDisplays[index].textContent = value;    
    
    // 根据滑块ID更新数据
    switch(this.id) {
        case 'slider1':
           simulationConfig.cohesionWeight = value;
        break;
        case 'slider2':
           simulationConfig.alignmentWeight = value;
        break;
        case 'slider3':
           simulationConfig.separationWeight = value;
        break; 
        case 'slider4':
           simulationConfig.perceptionRadius = value;
        break;   
        case 'slider5': 
           simulationConfig.foodWeight= value;
        break;        
       
        }    
  });
});
