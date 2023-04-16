uniform float u_time;
uniform vec3 baseColor;

varying vec2 vUv;

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                        vec2(12.9898,78.233)))*
        43758.5453123);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 6

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = _st * 2.2 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
  vec2 st = vUv * 1.2;
  vec3 color = vec3(0.0);

  float time = u_time * .5;
  
  vec2 q = vec2(0.);
  q.x = fbm( st + 0.00*time);
  q.y = fbm( st + vec2(1.0));

  vec2 r = vec2(0.);
  r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*time );
  r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.5*time);

  float f = fbm(st+r);

  vec3 base = baseColor;

  color = mix(vec3(base),
              vec3(base),
              clamp((f*f)*4.,0.,1.));

  color = mix(color,
              vec3(base) / 2.,
              clamp(length(q),0.,1.));

  color = mix(color,
              vec3(base) / 2.,
              clamp(length(r.x),0.,1.));

  gl_FragColor = vec4((f*f*f+.6*f*f+.5*f)*color, .76);
}