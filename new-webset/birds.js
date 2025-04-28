import { simulationConfig } from './config.js';
import { Food } from './food.js'

const ecoCanvas = document.getElementById('ecoCanvas');
const ctx = ecoCanvas.getContext('2d');
//上面的代码是把要用的工具都放出来，下面开始写



class Bird{
  constructor(x,y,size){
    this.x = x;
    this.y = y;
    this.size = size;
    this.bodyLength = 5*this.size;
    this.bodyWidth = 2*this.size;
    this.direction = Math.random()*Math.PI*2;
    this.speed = 1.5;
    //平滑转向
    this.turnSpeed = 0.02;
    this.targetDirection = Math.random()*Math.PI*2;
    
    //检测半径
    this.perceptionRadius = simulationConfig.perceptionRadius;
  }
  
  drawBird(){
    //鸟身上的另外三个个点
    let selfLx = this.x+this.bodyWidth*Math.cos(this.direction+Math.PI/2);
    let selfLy = this.y+this.bodyWidth*Math.sin(this.direction+Math.PI/2);
    let selfRx = this.x+this.bodyWidth*Math.cos(this.direction-Math.PI/2);
    let selfRy = this.y+this.bodyWidth*Math.sin(this.direction-Math.PI/2);
    let selfMx = this.x+this.bodyLength*Math.cos(this.direction);
    let selfMy = this.y+this.bodyLength*Math.sin(this.direction);
    
    ctx.beginPath();
    ctx.moveTo(this.x, this.y); // 起点
    ctx.lineTo(selfLx, selfLy);  // 第二条边
    ctx.lineTo(selfMx, selfMy);
    ctx.lineTo(selfRx, selfRy);// 第三条边
    ctx.closePath();       // 闭合路径
    ctx.fillStyle = '#080cff';
    ctx.fill();
  }
  
  //让鸟随机运动，使用平滑转向
  //update增加参数，未来所有鸟群的数组
  update(birds,foodList){
    //获取临近鸟
    const neighbors = this.getNeighbors(birds);
    
    //新增平均方向
    const cohesion = this.calculateCohesion(neighbors);
    const alignment = this.calculateAlignment(neighbors);
    const separation = this.calculateSeparation(neighbors);
    const foodattraction = this.calculateFoodAttraction(foodList);
    //改进，增加权重
    
    
    const combineX = cohesion.x * simulationConfig.cohesionWeight + 
                     alignment.x * simulationConfig.alignmentWeight + 
                     separation.x * simulationConfig.separationWeight +
                     foodattraction.x*simulationConfig.foodWeight ;
    const combineY = cohesion.y * simulationConfig.cohesionWeight + 
                     alignment.y * simulationConfig.alignmentWeight + 
                     separation.y * simulationConfig.separationWeight +
                     foodattraction.y*simulationConfig.foodWeight ;
    
    
    this.targetDirection = Math.atan2(
      combineY , combineX
    );
    
    //原来的平滑转向
    if (neighbors.length > 0){
      this.targetDirection += (Math.random()-.5)*Math.PI/4;
    }
    else {
      if (Math.random()<0.9){
        this.targetDirection += (Math.random() - 0.5) * Math.PI;
        
      }
      
    }
    
    const angleDiff = ((this.targetDirection - this.direction + Math.PI) % (Math.PI * 2)) - Math.PI;
    this.direction += angleDiff * this.turnSpeed;
    
    this.x += this.speed*Math.cos(this.direction);
    this.y += this.speed*Math.sin(this.direction);
    
    //边界传送
    if (this.x<0)this.x=ecoCanvas.width;
    if (this.x>ecoCanvas.width)this.x=0;
    if (this.y<0)this.y=ecoCanvas.height;
    if (this.y>ecoCanvas.height)this.y=0;
    
   // if (food.isEaten(this.x,this.y,this.size))food.respawn();
    
    
  }
  
  //获取临近鸟放入数组，供给三条规则使用
  getNeighbors(birds){
    return birds.filter((bird)=>{
      if (bird === this)return false;
      const dx = this.x-bird.x;
      const dy = this.y-bird.y;
      return (dx*dx+dy*dy) < this.perceptionRadius**2;
      
    });
  }
  //第一条规则，向中心靠拢，传入的参数是附近鸟的数组
  calculateCohesion(neighbors){
    if (neighbors.length == 0)return {x:0 , y:0}
    const center = neighbors.reduce((sum,current)=>{
     return{x:sum.x+=current.x , y:sum.y+=current.y}
    },{x:0 , y:0})
    center.x = (center.x/neighbors.length-this.x)/200;
    center.y = (center.y/neighbors.length-this.y)/200;
    return center;
  }
  
  //第二条规则，与群体方向对齐
  calculateAlignment(neighbors){
    if (neighbors.length ==0) return {x:0 , y:0};
    const avgDirection = neighbors.reduce((sum,bird)=>({
      x: sum.x+Math.cos(bird.direction),
      y: sum.y+Math.sin(bird.direction)
    }),{x:0 , y:0})
    return {
     x: avgDirection.x/neighbors.length,
     y: avgDirection.y/neighbors.length
      
    };
  }
  
  //第三条规则，不要靠太近
  calculateSeparation(neighbors){
    const steer = {x:0 ,y:0};
    const minDistance = this.size*10;
    neighbors.forEach(bird=>{
      const dx = this.x-bird.x;
      const dy = this.y-bird.y;
      const distance = Math.sqrt(dx*dx + dy*dy);
      if (distance < minDistance){
        steer.x += dx/distance;
        steer.y += dy/distance
        
      }
      
      })
    return steer;
  }
  
  // 新增方法：计算食物吸引力向量
calculateFoodAttraction(foodList) {
    if (!foodList || foodList.length === 0) return { x: 0, y: 0 };

    // 找到距离最近的食物
    let closestFood = null;
    let closestDistance = Infinity;

    for (const food of foodList) {
        const dx = food.x - this.x;
        const dy = food.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < closestDistance && distance <= simulationConfig.perceptionRadius) {
            closestDistance = distance;
            closestFood = food;
        }
    }

    if (!closestFood) return { x: 0, y: 0 };
    const dx = closestFood.x - this.x;
    const dy = closestFood.y - this.y;
    const strength = 10 / (closestDistance + 0.1); // 防止除以零

    return {
        x: (dx / closestDistance) * strength,
        y: (dy / closestDistance) * strength
    };
}
}

let foodList = [];
ecoCanvas.addEventListener('click', function(event) {
    const rect = ecoCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

  
    const newFood = new Food(ctx, x, y);
    foodList.push(newFood);
});
const flock = [];
for (let i=0; i<70; i++){
  flock.push(new Bird(Math.random()*ecoCanvas.width,Math.random()*ecoCanvas.height,1+Math.random()))
}

function animation(){
  ctx.clearRect(0, 0, ecoCanvas.width, ecoCanvas.height);
  
  flock.forEach((bird)=>{bird.update(flock,foodList)});
  flock.forEach((bird)=>{bird.drawBird()});
      // 绘制所有食物，并检查是否被吃掉
    for (let i = foodList.length - 1; i >= 0; i--) {
        const food = foodList[i];
        food.drawFood();

        // 检查是否有鸟吃掉了这个食物
        flock.forEach((bird) => {
            if (food.isEaten(bird.x, bird.y, bird.size)) {
                // 被吃掉后移除食物
                foodList.splice(i, 1);
                //console.log("食物被吃掉了！");
            }
        });
  
  
  
     };
     requestAnimationFrame(animation);
}
animation();
export default Bird;