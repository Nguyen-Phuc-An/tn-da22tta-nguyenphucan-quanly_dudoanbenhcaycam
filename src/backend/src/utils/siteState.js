const fs = require('fs');
const path = require('path');

const STATE_FILE_PATH = path.resolve(__dirname, '../../data/site-state.json');

const ensureStateFile = () => {
  const stateDir = path.dirname(STATE_FILE_PATH);
  fs.mkdirSync(stateDir, { recursive: true });

  if (!fs.existsSync(STATE_FILE_PATH)) {
    fs.writeFileSync(
      STATE_FILE_PATH,
      JSON.stringify({ maintenanceMode: false }, null, 2),
      'utf-8'
    );
  }
};

const readSiteState = () => {
  ensureStateFile();

  try {
    const raw = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);

    return {
      maintenanceMode: Boolean(parsed.maintenanceMode),
    };
  } catch (error) {
    return { maintenanceMode: false };
  }
};

const writeSiteState = (nextState) => {
  ensureStateFile();

  const currentState = readSiteState();
  const mergedState = {
    ...currentState,
    ...nextState,
    maintenanceMode: Boolean(nextState.maintenanceMode),
  };

  fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(mergedState, null, 2), 'utf-8');

  return mergedState;
};

module.exports = {
  readSiteState,
  writeSiteState,
};