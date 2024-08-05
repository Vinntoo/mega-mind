import { DLLMId, getKnowledgeMapCutoff } from '~/modules/llms/store-llms';

/*type Variables =
  | '{{Today}}'
  | '{{Cutoff}}'
  | '{{RenderMermaid}}'
  | '{{RenderPlantUML}}'
  | '{{RenderSVG}}'
  | '{{InputImage0}}'
  | '{{ToolBrowser0}}';

type VariableResolverContext = {
  assistantLlmId: DLLMId;
};

const variableResolvers: { [key in Variables]: (context: VariableResolverContext) => string } = {
  '{{Today}}': () => {
    const today = new Date();
    return today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  },
  '{{Cutoff}}': (context) => {
    return getKnowledgeMapCutoff(context.assistantLlmId) || '';
  },

  '{{RenderMermaid}}': () => 'Mermaid rendering: Enabled',
  '{{RenderPlantUML}}': () => 'PlantUML rendering: Enabled',
  '{{RenderSVG}}': () => 'SVG rendering: Enabled',

  '{{InputImage0}}': () => 'Image input capabilities: Disabled',

  '{{ToolBrowser0}}': () => 'Web browsing capabilities: Disabled',
};*/


/**
 * This will be made a module and fully reactive in the future.
 */
export function bareBonesPromptMixer(_template: string, assistantLlmId: DLLMId | undefined) {

  let mixed = _template;

  // {{Today}} - yyyy-mm--dd but in user's local time, not UTC
  const today = new Date();
  const varToday = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  mixed = mixed.replaceAll('{{Today}}', varToday);

  // {{LocaleNow}} - enough information to get on the same page with the user
  if (mixed.includes('{{LocaleNow}}')) {
    const userLocale = navigator.language || 'en-US';
    // const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    // Format the current date and time according to the user's locale and timezone
    const formatter = new Intl.DateTimeFormat(userLocale, {
      weekday: 'short', // Full name of the day of the week
      year: 'numeric', // Numeric year
      month: 'short', // Full name of the month
      day: 'numeric', // Numeric day of the month
      hour: '2-digit', // 2-digit hour
      minute: '2-digit', // 2-digit minute
      timeZoneName: 'short', // Short timezone name (e.g., GMT, CST)
      hour12: true, // Use 12-hour time format; set to false for 24-hour format if preferred
    });
    const formattedDateTime = formatter.format(new Date());
    mixed = mixed.replaceAll('{{LocaleNow}}', formattedDateTime /*`${formattedDateTime} (${userTimezone})`*/);
  }

  // {{Render...}}
  mixed = mixed.replace('{{RenderMermaid}}', 'Mermaid rendering: Enabled');
  mixed = mixed.replace('{{RenderPlantUML}}', 'PlantUML rendering: Enabled');
  mixed = mixed.replace('{{RenderSVG}}', 'SVG rendering: Enabled');

  // {{Input...}} / {{Tool...}} - TBA
  mixed = mixed.replace('{{InputImage0}}', 'Image input capabilities: Disabled');
  mixed = mixed.replace('{{ToolBrowser0}}', 'Web browsing capabilities: Disabled');

  // {{Cutoff}} or remove the line
  const varCutoff = getKnowledgeMapCutoff(assistantLlmId);
  if (varCutoff)
    mixed = mixed.replaceAll('{{Cutoff}}', varCutoff);
  else
    mixed = mixed.replaceAll(/.*{{Cutoff}}.*\n?/g, '');

  // at most leave 2 newlines in a row
  mixed = mixed.replace(/\n{3,}/g, '\n\n');

  return mixed;
}