import { map } from 'lodash';
import m from 'mithril'
import { ListTile } from 'polythene-mithril'
import { mergeAttrs } from './Attrs'

export let mapListTile = (tiles, defaults, safe) => map(tiles, (tile) => m(ListTile, mergeAttrs(tile, defaults, safe)))