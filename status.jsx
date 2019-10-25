import { styled, run } from 'uebersicht';

const colors = {
  background: '#651b1e',
  text: '#f9f8a6',
};

const execute = (action, interval) => {
  action();

  setInterval(action, interval);
};

export const refreshFrequency = false;

export const command = dispatch => {
  execute(() => dispatch({ date: new Date() }), 60000);

  execute(() => {
    run(
      `pmset -g batt | egrep '([0-9]+\%).*' -o --colour=auto | cut -f1 -d'%'`
    ).then(battery => dispatch({ battery: parseInt(battery, 10) }));
  }, 60000);

  execute(() => {
    run(`pmset -g batt | grep "'.*'" | sed "s/'//g" | cut -c 18-19`).then(
      power => dispatch({ power: power.trim() })
    );
  }, 5000);

  execute(() => {
    run(`top -l 1 | grep -E "^CPU"`).then(usage => {
      const values = usage
        .replace(/^CPU usage:/, '')
        .split(',')
        .map(val => parseInt(val, 10));

      dispatch({ cpu: values[0] + values[1] });
    });
  }, 60000);
};

export const updateState = (data, previousState) => ({
  ...previousState,
  ...data,
});

const Panel = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 4px;
  font-family: Fira Code, monospace;
  font-size: 12px;
  color: ${colors.text};
  fill: currentColor;
  background-color: rgba(0, 0, 0, 0.5);
  -webkit-backdrop-filter: blur(10px);
`;

const Item = styled('button')`
  appearance: none;
  background: none;
  border: 0;
  padding: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: inherit;
  font: inherit;

  > svg {
    padding-right: 8px;
  }
`;

const Calendar = ({ value }) => (
  <svg width="14px" height="16px" viewBox="0 0 14 16">
    <rect x="0" y="2" width="14" height="12" rx="2" />
    <rect x="3" y="0" width="2" height="4" rx="0.5" />
    <rect x="9" y="0" width="2" height="4" rx="0.5" />
    <text
      textAnchor="middle"
      x="50%"
      y="11"
      fontSize="8"
      fontWeight="bold"
      fill={colors.background}
    >
      {value}
    </text>
  </svg>
);

const Battery = ({ value, charging }) => (
  <svg width="19px" height="14px" viewBox="0 0 19 14">
    <path d="M2,1 L16,1 C17.1045695,1 18,1.8954305 18,3 L18,11 C18,12.1045695 17.1045695,13 16,13 L2,13 C0.8954305,13 1.3527075e-16,12.1045695 0,11 L0,3 C-1.3527075e-16,1.8954305 0.8954305,1 2,1 Z M2,2 C1.44771525,2 1,2.44771525 1,3 L1,11 C1,11.5522847 1.44771525,12 2,12 L16,12 C16.5522847,12 17,11.5522847 17,11 L17,3 C17,2.44771525 16.5522847,2 16,2 L2,2 Z" />
    <rect x="2" y="3" width={Math.floor((14 / 100) * value)} height="8" />
    <rect x="17" y="5" width="2" height="4" rx="0.5" />
    {charging ? (
      <path
        d="M3.23076923,4 L5.07692308,4 L5.07692308,9.5 L8.27538462,3 L3.72461538,3 L3.23076923,4 Z M6.92307692,2 L6.92307692,-3.5 L4.21384615,2 L3.72461538,3 L8.27538462,3 L8.76923077,2 L6.92307692,2 Z"
        transform="translate(9.000000, 7.000000) scale(-1, 1) rotate(90.000000) translate(-6.000000, -3.000000)"
        fill={colors.background}
      />
    ) : null}
  </svg>
);

const Cpu = () => (
  <svg width="16px" height="16px" viewBox="0 0 16 16">
    <path d="M14,11.3333333 L14,12 C14,13.1045695 13.1045695,14 12,14 L11,14 L11,16 L10,16 L10,14 L8.5,14 L8.5,16 L7.5,16 L7.5,14 L6,14 L6,16 L5,16 L5,14 L4,14 C2.8954305,14 2,13.1045695 2,12 L2,11.3333333 L0,11.3333333 L0,10.3333333 L2,10.3333333 L2,8.66666667 L0,8.66666667 L0,7.66666667 L2,7.66666667 L2,6 L0,6 L0,5 L2,5 L2,4 C2,2.8954305 2.8954305,2 4,2 L5,2 L5,0 L6,0 L6,2 L7.5,2 L7.5,0 L8.5,0 L8.5,2 L10,2 L10,0 L11,0 L11,2 L12,2 C13.1045695,2 14,2.8954305 14,4 L14,5 L16,5 L16,6 L14,6 L14,7.66666667 L16,7.66666667 L16,8.66666667 L14,8.66666667 L14,10.3333333 L16,10.3333333 L16,11.3333333 L14,11.3333333 Z M4,3 C3.44771525,3 3,3.44771525 3,4 L3,12 C3,12.5522847 3.44771525,13 4,13 L12,13 C12.5522847,13 13,12.5522847 13,12 L13,4 C13,3.44771525 12.5522847,3 12,3 L4,3 Z" />
    <rect x="4" y="4" width="8" height="8" rx="1" />
  </svg>
);

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const render = ({ date = Date.now(), cpu, battery = 0, power }) => {
  return (
    <Panel>
      <Item onClick={() => run('open -a "Activity Monitor"')}>
        <Cpu />
        {cpu}%
      </Item>
      <Item>
        <Battery value={Number(battery)} charging={power === 'AC'} />
        {battery}%
      </Item>
      <Item>
        <Calendar value={date.getDate()} />
        {date.getDate()} {days[date.getDay()]}{' '}
        {('0' + date.getHours()).slice(-2)}:
        {('0' + date.getMinutes()).slice(-2)}
      </Item>
    </Panel>
  );
};

export const className = `
  top: 24px;
  right: 24px;
`;
