import bodyParser from 'body-parser';
import cors from 'cors';

export const configureServer = (app) => {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
};