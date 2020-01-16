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
  find,
  curryRight,
  defaultTo
} from 'lodash/fp';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const themeOrder: ThemeType[] = ['filled', 'outlined', 'twotone'];
const placeholder = '-';
const username = 'HeskeyBaozi';
const projectname = 'ant-design-icons-list';
const branch = 'master';
const pathTo = 'inline';

const themeOrderMapFn: (theme: string) => number = memoize(
  (theme) => compose(invert, toPlainObject)(themeOrder)[theme]
);

const defTransform: (defs: (string | IconDefinition)[]) => string[] = flow(
  map<string | IconDefinition, string>((def) =>
    typeof def === 'string'
      ? def
      : flow(
          curryRight(renderIconDefinitionToSVGElement)({
            extraSVGAttrs: {
              xmlns: 'http://www.w3.org/2000/svg',
              width: '70',
              height: '70'
            }
          }),
          // effects
          // This is hacked.
          (SVG: string) => {
            writeFileSync(
              resolve(__dirname, `../${pathTo}/${def.name}-${def.theme}.svg`),
              SVG,
              'utf8'
            );
            return (
              `![${def.name}-${def.theme}](https://raw.githubusercontent.com/` +
              `${username}/${projectname}/${branch}/${pathTo}/${def.name}-${def.theme}.svg?sanitize=true)`
            );
          }
        )(def)
  )
);

const transformToIconsTable = flow(
  groupBy(({ name }: IconDefinition) => name),
  toPairs,
  sortBy((pairs: [string, IconDefinition[]]) => 0 - pairs[1].length),
  map(([name, defs]: [string, IconDefinition[]]) => [
    name,
    flow(
      sortBy(({ theme }: IconDefinition) => themeOrderMapFn(theme)),
      (defs: IconDefinition[]): (string | IconDefinition)[] =>
        flow(
          map((theme: string) =>
            flow(
              find((def: IconDefinition) => def.theme === theme),
              defaultTo<string | IconDefinition>(placeholder)
            )(defs)
          )
        )(themeOrder)
    )(defs)
  ]),
  map(([name, defsOrDash]: [string, (string | IconDefinition)[]]) =>
    flatten([name, defTransform(defsOrDash)])
  )
);

export const iconsTable = transformToIconsTable(allIconDefs);
