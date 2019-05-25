
const pi = 3.14159265358979323;

var theta1 = convert_to_rad(document.getElementById("theta1").value)
var theta2 = convert_to_rad(document.getElementById("theta2").value)

var time = 0;
const h = 1 / 6;

const g = 9.8;

var m1 = 1;
var m2 = 1;
var l1;
var l2;


function RK4(x){
  k1 = RHS(x)

  k2_params = array_x_const(k1, h/2)
  k2 = RHS(add_array(x, k2_params))

  k3_params = array_x_const(k2, h/2)
  k3 = RHS(add_array(x, k3_params))

  k4_params = array_x_const(k3, h)
  k4 = RHS(add_array(x, k4_params))

  slope_approx_1 = array_x_const(k1, h / 6)
  slope_approx_2 = array_x_const(k2, h / 3)

  slope_approx_3 = array_x_const(k3, h / 3)
  slope_approx_4 = array_x_const(k4, h / 6)

  weighted_slope_approx = add_array(add_array(slope_approx_1, slope_approx_2), add_array(slope_approx_3, slope_approx_4))

  time += h

  x = add_array(x, weighted_slope_approx)
  return x
}

function sketchProc(processing) {
    // console.log('hi')
    processing.size(500,500);

    var dT1  = 0;
    var dT2  = 0;
    var ddT1 = 0;
    var ddT2 = 0;

    m1 = 1;
    m2 = 1;

    theta1 = convert_to_rad(document.getElementById("theta1").value)
    theta2 = convert_to_rad(document.getElementById("theta2").value)

    theta1_2 = convert_to_rad(document.getElementById("theta1_2").value)
    theta2_2 = convert_to_rad(document.getElementById("theta2_2").value)

    processing.strokeWeight(3);
    const anchorX = processing.width / 2, anchorY = processing.height / 2;
    const maxArmLength = Math.min(anchorX, anchorY) / 2.2;

    l1 = maxArmLength;
    l2 = maxArmLength;

    init_omega_theta1 = 0
    init_omega_theta2 = 0

    var c1 = processing.color(0, 0, 0);
    var c2 = processing.color(20, 20, 255)



    var x1 = [ theta1, theta2, init_omega_theta1, init_omega_theta2 ]
    var x2 = [ theta1_2, theta2_2, 0, 0 ]

    var has_x2 = document.getElementById("x2").checked

    processing.draw = function() {

      x1 = RK4(x1)

      if(has_x2){
        x2 = RK4(x2)
      }

      var midX = anchorX + Math.sin(x1[0]) * maxArmLength * 0.9;
      var midY = anchorY + Math.cos(x1[0]) * maxArmLength * 0.9;
      var endX = midX    + Math.sin(x1[1]) * maxArmLength * 0.9;
      var endY = midY    + Math.cos(x1[1]) * maxArmLength * 0.9;


      processing.background(255);

      if (has_x2) {
        var midX2 = anchorX + Math.sin(x2[0]) * maxArmLength * 0.9;
        var midY2 = anchorY + Math.cos(x2[0]) * maxArmLength * 0.9;
        var endX2 = midX2    + Math.sin(x2[1]) * maxArmLength * 0.9;
        var endY2 = midY2    + Math.cos(x2[1]) * maxArmLength * 0.9;

        processing.stroke(c2);

        processing.line(anchorX, anchorY, midX2, midY2);
        processing.ellipse(midX2, midY2, 2, 2);

        processing.line(midX2, midY2, endX2, endY2);
        processing.ellipse(endX2, endY2, 5, 5);

        processing.stroke(c1);
      }

      processing.line(anchorX, anchorY, midX, midY);
      processing.ellipse(midX, midY, 2, 2);

      processing.line(midX, midY, endX, endY);
      processing.ellipse(endX, endY, 5, 5);




   };
   return processing
 }



 // attaching the sketchProc function to the canvas

function convert_to_rad(degrees){
  return((degrees * 2 * pi / 360)  % (2 * pi))
}

var processingInstance;

function start(){
  var canvas = document.getElementById("canvas1");
  processingInstance = new Processing(canvas, sketchProc);
  button = document.getElementById('submit')
  button.value = "Stop"
  button.onsubmit = function() { stop() }
  button.onclick = function() { stop() }
}

function stop(){
  processingInstance.exit()
  button.value = "Start"
  button.onsubmit = function() { start() }
  button.onclick = function() { start() }

}

function accel_of_theta1(x) {
  var theta1 = x[0]
  var theta2 = x[1]
  var dT1    = x[2]
  var dT2    = x[3]

  var m  = m1 + m2
  var numerator = -1*g*(m + m1)*sin(theta1) - m2*g*sin(theta1 - 2*theta2) - 2*sin(theta1 - theta2)*m2*(dT1*dT1 *l1*cos(theta1 - theta2) + dT2*dT2*l2)
  var denominator = l1*(m + m1 - m2 * cos(2*(theta1 - theta2)))
  return numerator / denominator
}

function accel_of_theta2(x) {
  // puts( "m1 is " + m1)
  var theta1 = x[0]
  var theta2 = x[1]
  var dT1    = x[2]
  var dT2    = x[3]

  var m  = m1 + m2
  var numerator = 2*sin(theta1 - theta2) * (m*dT1*dT1*l1 + g*m*cos(theta1) + dT2*dT2*l2*m2*cos(theta1 - theta2))
  var denominator = l2 *(m + m1 - m2*cos(2*(theta1 - theta2)))
  return numerator / denominator
}

function sin(x) {
  return Math.sin(x % (2* pi))
}

function cos(x) {
  return Math.cos(x % (2* pi))
}

// Left hand side is
// d( theta )/dt = omega
// d( omega )/dt = f_of_theta

//output array is [ theta, omega ]
function RHS(x) {
  output = []
  output[0] = x[2]
  output[1] = x[3]
  output[2] = accel_of_theta1(x)
  output[3] = accel_of_theta2(x)
  return output
}

function add_array(x, y) {
  output = [null, null, null, null]
  for (var i = 0; i < x.length; i++) {
    output[i] = x[i] + y[i]
  }

  return output
}

function array_x_const(x, k) {
  output = [null, null, null, null]
  for (var i = 0; i < x.length; i++) {
    output[i] = x[i] * k
  }

  return output
}

function array_add_constant(x, k) {
  output = add_array(x, [k, k, k, k])

  return output
}

function puts(str) {
  console.log(str)
}
