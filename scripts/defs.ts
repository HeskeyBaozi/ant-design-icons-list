import * as allIconDefs from '@ant-design/icons-svg';
import { IconDefinition, ThemeType } from '@ant-design/icons-svg/lib/types';
import { renderIconDefinitionToSVGElement } from '@ant-design/icons-svg/lib/helpers';
import {
  flow,
  compose,
  groupBy,
  toPairs,
  sortBy,
  map,
  invert,
  toPlainObject,
  memoize,
  flatten,
  concat,
  fill,
  __,
  slice,
  curryRight
} from 'lodash/fp';
import btoa from 'btoa';

const themeOrder: ThemeType[] = ['filled', 'outlined', 'twotone'];
const placeholder = '-';

const themeOrderMapFn: (theme: string) => number = memoize(
  (theme) => compose(invert, toPlainObject)(themeOrder)[theme]
);

const defTransform: (defs: IconDefinition[]) => string[] = flow(
  map<IconDefinition, string>((def) =>
    flow(
      curryRight(renderIconDefinitionToSVGElement)({
        extraSVGAttrs: {
          xmlns: 'http://www.w3.org/2000/svg',
          width: '70',
          height: '70'
        }
      }),
      btoa,
      (base64: string) => `<img src="data:image/svg+xml;base64,${base64}"/>`
    )(def)
  ),
  concat(
    __,
    fill(0, themeOrder.length, __, Array(themeOrder.length))(placeholder)
  ),
  slice(0, themeOrder.length)
);

const transformToIconsTable = flow(
  groupBy(({ name }: IconDefinition) => name),
  toPairs,
  sortBy(([_, defs]: [string, IconDefinition[]]) => 0 - defs.length),
  map(([name, defs]: [string, IconDefinition[]]) => [
    name,
    sortBy(({ theme }: IconDefinition) => themeOrderMapFn(theme))(defs)
  ]),
  map(([name, defs]: [string, IconDefinition[]]) =>
    flatten([name, defTransform(defs)])
  )
);

export const iconsTable = transformToIconsTable(allIconDefs);
