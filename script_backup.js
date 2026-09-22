// ============================================================
// WebGL Procedural Landscape Renderer
// Generates: mountains, water reflections, glowing river, ring
// ============================================================

(function () {
    const canvas = document.getElementById('landscape-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: true, alpha: false });
    if (!gl) { console.error('WebGL not supported'); return; }

    // --- Shader Sources ---

    const VERT = `
        attribute vec2 a_pos;
        void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;

    const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2 u_res;

/* ---- noise ---- */
float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123);
}
float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm4(vec2 p){
    float v=0.0, a=0.5;
    mat2 r=mat2(.87,.5,-.5,.87);
    for(int i=0;i<4;i++){v+=a*noise(p);p=r*p*2.0+100.0;a*=.5;}
    return v;
}
float fbm6(vec2 p){
    float v=0.0, a=0.5;
    mat2 r=mat2(.87,.5,-.5,.87);
    for(int i=0;i<6;i++){v+=a*noise(p);p=r*p*2.0+100.0;a*=.5;}
    return v;
}
float ridgedNoise(vec2 p){
    return 1.0 - abs(noise(p)*2.0-1.0);
}
float fbmRidged(vec2 p){
    float v=0.0, a=0.5;
    mat2 r=mat2(.87,.5,-.5,.87);
    for(int i=0;i<4;i++){v+=a*ridgedNoise(p);p=r*p*2.0+100.0;a*=.5;}
    return v;
}

/* ---- constants ---- */
const float WL = 0.42; // water line (fraction from bottom)

/* ---- mountain height at x for given layer ---- */
float mtnH(float x, float layer){
    float sc = 3.0 + layer*2.0;
    float off = layer*3.7;
    float base = 0.24 - layer*0.03;
    // valley in center
    float vc = 0.48;
    float valley = smoothstep(0.0, 0.25 - layer*0.02, abs(x - vc));
    valley = mix(0.06, 1.0, valley);
    
    // JAGGED peaks: heavy ridged noise + sharp detail
    float s = fbm4(vec2(x*sc+off, off*0.7));
    float rd = fbmRidged(vec2(x*sc*1.5+off+2.0, off+1.0));
    // sharp detail layer - high frequency jagged edges
    float sharp = ridgedNoise(vec2(x*sc*4.0+off, off*2.3))*.15;
    sharp += ridgedNoise(vec2(x*sc*8.0+off+5.0, off*1.7))*.06;
    
    // heavily favor ridged noise (70%) for jagged look
    float h = mix(s, rd, 0.7) + sharp;
    
    return WL + base * h * valley;
}

/* ---- scene color above water ---- */
vec3 scene(vec2 uv){
    vec3 c = vec3(0.0);
    float asp = u_res.x/u_res.y;
    float skyY = (uv.y - WL)/(1.0-WL);

    // sky gradient - very dark, near black
    vec3 st=vec3(.002,.004,.012), sm=vec3(.008,.015,.025), sh=vec3(.018,.025,.035);
    c = skyY>.5 ? mix(sm,st,(skyY-.5)*2.0) : mix(sh,sm,skyY*2.0);

    // stars
    if(skyY>.35){
        vec2 sg=floor(uv*vec2(600.0,350.0));
        float sv=hash(sg);
        if(sv>.9975){
            float br=(sv-.9975)*400.0;
            float tw=.5+.5*sin(u_time*(1.5+sv*4.0)+sv*500.0);
            c+=vec3(.3,.35,.5)*br*tw*(skyY-.35)*.5;
        }
    }

    // glowing ring / planet arc - HALF BEHIND mountains
    // center lowered so mountains occlude bottom half
    vec2 rc=vec2(.5, WL+.08);
    float rr=.35;
    vec2 ruv=(uv-rc)*vec2(asp,1.0);
    float rd2=length(ruv);
    // only show ring above water line area
    float um=smoothstep(WL+.01, WL+.08, uv.y);
    // ring line - thin, green
    float rl=smoothstep(.004,0.0,abs(rd2-rr))*um;
    c+=vec3(0.,.6,.4)*rl*.45;
    // ring glow - subtle
    c+=vec3(0.,.2,.14)*exp(-abs(rd2-rr)*22.0)*um*.3;
    c+=vec3(0.,.06,.04)*exp(-abs(rd2-rr)*6.0)*um*.18;

    // warm sun glow at horizon center - subdued amber
    vec2 sp=vec2(.5, WL+.01);
    float sd=length((uv-sp)*vec2(asp*.4, 3.5));
    c+=vec3(.25,.16,.04)*exp(-sd*sd*8.0)*.2;
    c+=vec3(.08,.05,.02)*exp(-sd*sd*2.0)*.1;

    // mountains (4 layers, back to front)
    for(int i=0;i<4;i++){
        float l=float(i);
        float mh=mtnH(uv.x, l);
        if(uv.y<mh){
            float depth=(mh-uv.y)/(0.24-l*0.03);
            float dk=0.016-l*0.003;
            vec3 mc=vec3(dk*.4, dk*.55, dk*.8);

            // normal-based lighting (for 2 closest layers)
            if(i>=2){
                float eps=0.003;
                float hL=mtnH(uv.x-eps,l);
                float hR=mtnH(uv.x+eps,l);
                float slope=(hR-hL)/(2.0*eps);
                float ld=sign(.5-uv.x);
                mc*=(.5+.35*(.5+.5*slope*ld*.25));
            }

            // rocky texture
            float tx=noise(uv*vec2(100.0+l*40.0, 180.0+l*50.0));
            mc+=vec3(tx*.002);

            // atmospheric haze on far layers
            float hz=(3.0-l)*.003;
            mc+=vec3(hz*.2, hz*.35, hz*.5);

            // snow/frost on peaks
            if(depth<.05){
                float snow=noise(vec2(uv.x*60.0+l*10.0, uv.y*100.0));
                if(snow>.7) mc+=vec3(.008,.01,.012)*(1.0-depth/.05);
            }

            // sun rim light on ridges near center gap
            float rimD=abs(uv.x-.5);
            if(rimD<.08 && depth<.04){
                float rim=(.08-rimD)/.08*(1.0-depth/.04);
                mc+=vec3(.035,.025,.01)*rim*(1.0-l*.3);
            }

            c=mc;
        }
    }
    return c;
}

/* ---- river center x ---- */
float riverX(float t){
    return .5 + .14*sin(t*5.2-.3) - t*.07;
}

void main(){
    vec2 uv = gl_FragCoord.xy / u_res;
    float asp = u_res.x/u_res.y;
    vec3 c;

    if(uv.y > WL){
        // sky + mountains
        c = scene(uv);
    } else {
        // water
        float wd = (WL-uv.y)/WL; // 0 at surface, 1 at bottom
        vec2 rfl = vec2(uv.x, 2.0*WL - uv.y);
        // ripple distortion
        float dist = .007*(1.0-wd*.5);
        rfl.x += noise(vec2(uv.x*28.0+u_time*.08, uv.y*8.0+u_time*.12))*dist;
        rfl.y += noise(vec2(uv.x*14.0-u_time*.06, uv.y*14.0+u_time*.1))*dist*1.8;
        // reflected scene
        vec3 refl = scene(rfl);
        float rs = .22*(1.0-wd*.7);
        c = refl*rs + vec3(.002,.006,.014);

        // horizontal ripple highlights
        float rp = sin(uv.y*200.0+u_time*.45+noise(vec2(uv.x*5.0,uv.y*10.0))*4.0);
        rp = pow(max(rp,0.0),30.0)*.008*(1.0-wd*.85);
        c += vec3(rp*.1, rp*.4, rp*.55);

        // fresnel
        c += vec3(.005,.012,.018)*pow(1.0-wd,4.0)*.04;
    }

    // RIVER S-curve
    float t = (WL-uv.y)/WL;
    if(uv.y <= WL){
        float rx = riverX(t);
        
        // Create flowing liquid distortion
        float flowTime = u_time * 1.5;
        float flowDistortion = (fbm4(vec2(uv.x * 30.0, uv.y * 40.0 - flowTime)) - 0.5) * 0.02 * t;
        float rDist = abs(uv.x - (rx + flowDistortion));
        
        float ws = 1.0+t*3.5;
        
        // flowing fluid highlights
        float fluidFlow = fbm4(vec2(uv.x * 15.0, uv.y * 50.0 - flowTime * 2.0));
        float fluidGlow = smoothstep(0.4, 0.8, fluidFlow);
        
        // atmospheric glow - green tinted
        c += vec3(0., .04, .025) * exp(-rDist*rDist/(.012*ws)) * .12;
        // medium glow - GREEN dominant
        c += vec3(0., .07, .035) * exp(-rDist*rDist/(.003*ws)) * .35;
        // core glow - neon green, pulsing with flow
        c += vec3(.02, .12, .06) * exp(-rDist*rDist/(.0005*ws)) * (.6 + fluidGlow*.3);
        
        // bright center - moving liquid energy
        float ctr = exp(-rDist*rDist/(.00005*ws));
        c += vec3(ctr*.4, ctr*.95, ctr*.6) * (0.8 + fluidGlow * 0.5);
        
        // flow particles (streaks of light moving fast)
        float fl = sin((t*25.0 - u_time*2.5)*3.14159)*.5+.5;
        fl = pow(fl, 8.0);
        c += vec3(0.,.08,.05)*exp(-rDist*rDist/(.0001*ws))*fl*.6;
        
        // water spread glow - subtle green
        c += vec3(0., .025, .015)*exp(-rDist*rDist/(.05*ws))*.035;
    }
    // river fading into mountain gap
    if(uv.y > WL && uv.y < WL+.05){
        float fade = 1.0-(uv.y-WL)/.05;
        float rd3 = abs(uv.x-.5);
        c += vec3(.01,.04,.025)*exp(-rd3*rd3/.0003)*fade;
    }

    // foreground rocky shore (bottom right corner, subtle)
    float shoreX = .88 + .04*fbm4(vec2(uv.y*10.0, 5.0));
    if(uv.x > shoreX && uv.y < .12){
        float sf = smoothstep(shoreX, shoreX+.02, uv.x);
        float sv = smoothstep(.12, .06, uv.y);
        c = mix(c, vec3(.008,.015,.022)+noise(uv*200.0)*.01, sf*sv*.7);
    }
    // bottom left shore hint
    float shoreL = .1 - .03*fbm4(vec2(uv.y*12.0, 8.0));
    if(uv.x < shoreL && uv.y < .08){
        float sf2 = smoothstep(shoreL, shoreL-.02, uv.x);
        float sv2 = smoothstep(.08, .03, uv.y);
        c = mix(c, vec3(.006,.012,.018)+noise(uv*180.0)*.008, sf2*sv2*.5);
    }

    // bottom fade
    c *= smoothstep(0.0, .06, uv.y);

    // vignette
    vec2 vu=uv-.5;
    c *= 1.0 - dot(vu,vu)*.5;

    // tone map + gamma
    c = c/(c+.1);
    c = pow(c, vec3(.95));

    gl_FragColor = vec4(c, 1.0);
}
`;

    // --- Compile shader ---
    function createShader(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error('Shader error:', gl.getShaderInfoLog(s));
            gl.deleteShader(s);
            return null;
        }
        return s;
    }

    const vs = createShader(gl.VERTEX_SHADER, VERT);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error('Link error:', gl.getProgramInfoLog(prog));
        return;
    }
    gl.useProgram(prog);

    // --- Fullscreen quad ---
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // --- Uniforms ---
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');

    // --- Resize ---
    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    // --- Render loop ---
    const start = performance.now();
    function frame() {
        const t = (performance.now() - start) / 1000.0;
        gl.uniform1f(uTime, t);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(frame);
    }
    frame();
})();

// ============================================================
// UI Logic (Lucide Icons, Navbar, Scroll Animations)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Lucide Icons
    if (window.lucide) lucide.createIcons();

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar && navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Scroll-triggered fade animations
    const els = document.querySelectorAll('.fade-in, .fade-in-up');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.15 });
    els.forEach(el => obs.observe(el));

    // Trigger hero animations immediately
    setTimeout(() => {
        document.querySelectorAll('.hero .fade-in, .hero .fade-in-up')
            .forEach(el => el.classList.add('visible'));
    }, 100);
});
