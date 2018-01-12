    //Main function (this is really a class)
    function Terrain(detail) {
        this.size = Math.pow(2, detail) + 1; //level of detail                            
        this.max = this.size - 1; //Max diamonds in block
        this.map = new Float32Array(this.size * this.size); //Map Size
      }
      //Kek, making sure user didnt input 0 as map size nor diamond generation
      Terrain.prototype.get = function(x, y) {
        if (x < 0 || x > this.max || y < 0 || y > this.max) return -1;
        return this.map[x + this.size * y];
      };
      //Setting size
      Terrain.prototype.set = function(x, y, val) {
        this.map[x + this.size * y] = val;
      };
      //Generation
      Terrain.prototype.generate = function(roughness) {
        var self = this;
        this.set(0, 0, self.max);
        this.set(this.max, 0, self.max / 2);
        this.set(this.max, this.max, 0);
        this.set(0, this.max, self.max / 2);
        divide(this.max);
        function divide(size) {
          var x, y, half = size / 2;
          var scale = roughness * size;
          if (half < 1) return;
          for (y = half; y < self.max; y += size) {
            for (x = half; x < self.max; x += size) {
              square(x, y, half, Math.random() * scale * 2 - scale);
            }
          }
          for (y = 0; y <= self.max; y += half) {
            for (x = (y + half) % size; x <= self.max; x += size) {
              diamond(x, y, half, Math.random() * scale * 2 - scale);
            }
          }
          divide(size / 2);
        }
        //Avoiding randomness
        function average(values) {
          var valid = values.filter(function(val) { return val !== -1; });
          var total = valid.reduce(function(sum, val) { return sum + val; }, 0);
          return total / valid.length;
        }
        //Squares function
        function square(x, y, size, offset) {
          var ave = average([
            self.get(x - size, y - size),   // upper left
            self.get(x + size, y - size),   // upper right
            self.get(x + size, y + size),   // lower right
            self.get(x - size, y + size)    // lower left
          ]);
          self.set(x, y, ave + offset);
        }
        //Diamond function
        function diamond(x, y, size, offset) {
          var ave = average([
            self.get(x, y - size),      // top
            self.get(x + size, y),      // right
            self.get(x, y + size),      // bottom
            self.get(x - size, y)       // left
          ]);
          self.set(x, y, ave + offset);
        }
      };
      //setting water at `sea level` and giving it a nice color rendering
      Terrain.prototype.draw = function(ctx, width, height) {
        var self = this;
        var waterVal = this.size * 0.3;
        for (var y = 0; y < this.size; y++) {
          for (var x = 0; x < this.size; x++) {
            var val = this.get(x, y);
            var top = project(x, y, val);
            var bottom = project(x + 1, y, 0);
            var water = project(x, y, waterVal);
            var style = brightness(x, y, this.get(x + 1, y) - val);
            rect(top, bottom, style);
            rect(water, bottom, 'rgba(50, 150, 200, 0.15)');
          }
        }
        //stone generation
        function rect(a, b, style) {
          if (b.y < a.y) return;
          ctx.fillStyle = style;
          ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
        }
        //brightness controll
        function brightness(x, y, slope) {
          if (y === self.max || x === self.max) return '#000';
          var b = ~~(slope * 50) + 128;
          return ['rgba(', b, ',', b, ',', b, ',1)'].join('');
        }
        //ISO -- DO NOT TOUCH
        function iso(x, y) {
          return {
            x: 0.5 * (self.size + x - y),
            y: 0.5 * (x + y)
          };
        }
        //Rendering everything
        function project(flatX, flatY, flatZ) {
          var point = iso(flatX, flatY);
          var x0 = width * 0.5;
          var y0 = height * 0.2;
          var z = self.size * 0.5 - flatZ + point.y * 0.75;
          var x = (point.x - self.size * 0.5) * 6;
          var y = (self.size - point.y) * 0.005 + 1;
          return {
            x: x0 + x / y,
            y: y0 + z / y
          };
        }
      };
      //Executing and creating/generating everything
      var display = document.getElementById('display');
      var ctx = display.getContext('2d');
      var width = display.width = window.innerWidth;
      var height = display.height = window.innerHeight;
      var terrain = new Terrain(10);
      terrain.generate(.7);
      terrain.draw(ctx, width, height);