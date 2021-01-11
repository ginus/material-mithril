// Generated by CoffeeScript 2.5.1
import m from 'mithril';

import stream from 'mithril/stream';

import {
  DialogPane,
  Icon,
  Shadow
} from "polythene-mithril";

import {
  AccountInput,
  PasswordInput
} from './Input';

import {
  PrimaryButton
} from './Button';

import {
  defaultsDeep
} from 'lodash';

// import {addTypography } from "polythene-css"
// addTypography()
export var Form = {
  view: function({attrs}) {
    return m(DialogPane, defaultsDeep(attrs));
  }
};

export var InlineForm = {
  view: function({attrs}) {
    return m('form.inline');
  }
};

export var LoginForm = {
  view: function({attrs}) {
    return m(Form, {
      body: [m(AccountInput, attrs.account), m(PasswordInput, attrs.password)],
      footer: [
        m(PrimaryButton,
        defaultsDeep(attrs.login,
        {
          label: '登录'
        })),
        m('a',
        defaultsDeep(attrs.reg,
        {
          text: '没有账号 去注册'
        }))
      ]
    });
  }
};

// url: m.route.link '/reg'
export var RegForm = {
  view: function({attrs}) {
    return m(Form, {
      body: [m(AccountInput, attrs.account), m(PasswordInput, attrs.password), m(PasswordInput, attrs.passwordRepeat)],
      footerButtons: [m(PrimaryButton, attrs.regButton)]
    });
  }
};

export var ChangePasswordForm = {
  view: function({attrs}) {
    return m(Form, {
      body: [m(PasswordInput, attrs.oldPassword), m(PasswordInput, attrs.password), m(PasswordInput, attrs.passwordRepeat)],
      footerButtons: [m(saveButton, attrs.save)]
    });
  }
};

export var searchForm = {
  view: function({attrs}) {}
};