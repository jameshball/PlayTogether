import Vex from 'vexflow';

const vf = new Vex.Flow.Factory({
   renderer: {elementId: 'stave', width: 500, height: 200}
});

const score = vf.EasyScore();
const system = vf.System();
