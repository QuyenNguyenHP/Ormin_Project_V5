export const fetchDebugModbusSnapshot = async () => {
  const response = await fetch("/api/debug/modbus-snapshot");

  if (!response.ok) {
    throw new Error(`Debug Modbus snapshot request failed with status ${response.status}`);
  }

  return response.json();
};

export const fetchPagePayload = async (pageName) => {
  const response = await fetch(`/api/${pageName}`);

  if (!response.ok) {
    throw new Error(`${pageName} request failed with status ${response.status}`);
  }

  return response.json();
};
