export const translate = (text: string): string => Scratch.translate(text);

export const keyMenuItems = [
  {text: translate('space'), value: 'space'},
  {text: translate('up arrow'), value: 'arrowup'},
  {text: translate('down arrow'), value: 'arrowdown'},
  {text: translate('right arrow'), value: 'arrowright'},
  {text: translate('left arrow'), value: 'arrowleft'},
  {text: translate('enter'), value: 'enter'},
  {text: translate('escape'), value: 'escape'},
  ...'abcdefghijklmnopqrstuvwxyz'.split('').map((value) => ({text: value, value})),
  ...'0123456789'.split('').map((value) => ({text: value, value}))
];
