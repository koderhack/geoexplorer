"use client";

import { useEffect, useRef } from "react";

const VS = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FS = `precision highp float;

varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// Simple 2D noise
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; ++i) {
        v += a * noise(p);
        p = rot * p * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = v_texCoord;

    // Slow movement to simulate "scanning"
    vec2 p = uv * 3.0 + vec2(u_time * 0.02, u_time * 0.01);

    float n = fbm(p);

    // Create topographic contour lines
    // n is the "elevation"
    float contour = sin(n * 25.0);
    float line = smoothstep(0.0, 0.1, abs(contour));
    line = 1.0 - line;

    // Base colors from the design system (GeoExplorer Tactical)
    // Surface: #12140f -> vec3(0.07, 0.08, 0.06)
    // Primary/Green: #bccbb9 -> vec3(0.74, 0.8, 0.73) - making it more subtle

    vec3 bgColor = vec3(0.07, 0.08, 0.06);
    vec3 lineColor = vec3(0.15, 0.2, 0.15); // Very subtle dark green lines

    // Add a bit of "glow" based on mouse proximity
    vec2 mouse = u_mouse / u_resolution;
    float dist = length(uv - mouse);
    lineColor += vec3(0.2, 0.3, 0.2) * (1.0 - smoothstep(0.0, 0.5, dist)) * 0.3;

    vec3 finalColor = mix(bgColor, lineColor, line * 0.4);

    // Add very faint scanline effect
    float scanline = sin(uv.y * u_resolution.y * 1.5) * 0.04;
    finalColor += scanline;

    gl_FragColor = vec4(finalColor, 1.0);
}`;

export default function ShaderBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Sync the WebGL drawing-buffer size with the CSS-driven layout size.
    // This fires on initial layout and whenever the element is resized.
    const syncSize = () => {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    const compileShader = (type, src) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, VS));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

    // u_mouse is in pixel coordinates matching u_resolution (ShaderToy convention).
    // Shaders that need normalized coords should use: u_mouse / u_resolution.
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const onMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    let animationFrameId;
    const render = (time) => {
      if (typeof ResizeObserver === "undefined") syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, time * 0.001);
      if (uResolution) gl.uniform2f(uResolution, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };
    render(0);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      if (resizeObserver) resizeObserver.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext?.();
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full opacity-40 z-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        width={390}
        height={884}
        className="block w-full h-full"
      />
    </div>
  );
}
