import { iconsTable } from './defs';
import { promises } from 'fs';
import { template, map, flow, join } from 'lodash/fp';
import { resolve } from 'path';

interface GenerateOptions {
  tplPath: string;
  outputPath: string;
}

const transformToContent = flow(
  map((columns: string[]) => `| ${columns.join(' | ')} |`),
  join('\n')
);

async function generate({ tplPath, outputPath }: GenerateOptions) {
  const withTemplate = template(await promises.readFile(tplPath, 'utf8'));
  const content = transformToContent(iconsTable);
  await promises.writeFile(outputPath, withTemplate({ content }), 'utf8');
}

generate({
  tplPath: resolve(__dirname, './list.md.template'),
  outputPath: resolve(__dirname, '../docs/list.md')
});
