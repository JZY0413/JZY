export class Food{
 constructor(ctx,x,y){
   this.ctx=ctx;
   this.x = x
   this.y = y
   this.size = 8;
   this.color = '#d6cf12';
   
 };
  drawFood(){
   this.ctx.beginPath(); // 开始新路径
   this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); // (x, y, 半径, 起始角, 结束角)
   this.ctx.fillStyle = this.color;
   this.ctx.fill(); // 填充路径
  };
  
  
  //本质其实是在问：能够到吗？
  //传入鸟实例的位置和大小，看看能不能够到食物
  isEaten(birdx,birdy,size){
    const dx = birdx-this.x;
    const dy = birdy-this.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    return distance < size*5;
  //需要永远记住的是，this只有在方法被调用的时候才能被确定
  //21行的this装在了isEaten里面，就算isEaten被带到了别的地方，这个this它还是food实例的
  };
  
  respawn(){
    this.x = Math.random()*ecoCanvas.width;
    this.y = Math.random()*ecoCanvas.height;
  }
}