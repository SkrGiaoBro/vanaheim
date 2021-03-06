import 'tsconfig-paths/register';
import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  routerPlus: {
    package: 'egg-router-plus',
    enable: true,
  },
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  validate: {
    enable: true,
    package: 'egg-validate',
  },
};

export default plugin;
