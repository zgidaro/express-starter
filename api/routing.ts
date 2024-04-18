import { DependsOnMethod, Routing } from 'express-zod-api'
import { uploadMediaHandler } from '@api/medias'
import {
  loginHandler,
  logoutHandler,
  signupHandler,
  validateHandler,
} from '@api/users'

export const zodRouting: Routing = {
  api: {
    medias: {
      '': new DependsOnMethod({
        post: uploadMediaHandler,
      }),
    },
    users: {
      login: new DependsOnMethod({
        post: loginHandler,
      }),
      logout: new DependsOnMethod({
        delete: logoutHandler,
      }),
      signup: new DependsOnMethod({
        post: signupHandler,
      }),
      validate: validateHandler,
    },
  },
}
