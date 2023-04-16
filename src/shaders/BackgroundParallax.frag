#ifdef GL_ES
  precision highp float;
#endif

uniform vec2 iResolution;
uniform float iTime;

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

varying vec2 fragCoord;

void main()
{
  vec2 uv = fragCoord;

  float zoom = 0.2;
  uv *= 1. - zoom;
  uv += zoom / 2.;

  float swirlTime = .04;
  
  vec2 uv0 = uv.xy;
  uv0.x += sin(iTime * swirlTime) * 0.11;
  uv0.y += cos(iTime * swirlTime) * 0.09;
  vec4 col = texture2D(iChannel0, uv0) / 4. - .01;
  
  vec2 uv1 = uv.xy;
  uv1.x += cos((iTime + 3241.) * swirlTime) * 0.09;
  uv1.y += sin((iTime + 1241.) * swirlTime) * 0.07;
  col += texture2D(iChannel1, uv1) / 4. + .01;

  gl_FragColor = col;
}