import { merge } from 'lodash'

export let mergeAttrs = (attrs, defaults, safe) => merge({}, defaults, attrs, safe)