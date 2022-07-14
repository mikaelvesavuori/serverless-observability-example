import http from 'k6/http';
import { sleep } from 'k6';

// Setup
const endpoint = 'https://RANDOM.execute-api.REGION.amazonaws.com/shared/greet'; // TODO: EDIT THIS TO YOUR ENDPOINT

/**
 * @description Get a random number.
 */
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};

/**
 * K6 configuration
 */
export const options = {
  vus: 10,
  duration: '5s'
};

/**
 * Magic number "4" is because there are4 valid users in the demo service.
 * We've reversed -1 to +1 so we get around 20% chance to use an incorrect value.
 */
const payload = {
  id: getRandomInt(0, 4 + 1) // -1
};

export default function () {
  http.post(endpoint, JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  sleep(1);
}
