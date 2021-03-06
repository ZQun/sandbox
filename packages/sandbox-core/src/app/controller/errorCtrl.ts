import * as Interface from '../../interface/services/IErrorService';
import * as moment from 'moment';
import * as _ from 'lodash';

import { inject, get, controller, provide, logger } from 'midway-mirror';

@provide()
@controller('/v2/api/error/')
export class ErrorCtrl {

  @logger()
  logger;

  @inject('errorService')
  errorServ;

  @get('/queryErrors')
  async queryErrors(ctx) {

    const startTime: moment.Moment = moment(parseInt(ctx.request.query.startTime, 10));
    const endTime: moment.Moment = moment(parseInt(ctx.request.query.endTime, 10));
    const ago: moment.Moment = moment().subtract(15, 'minutes');
    const _s: moment.Moment = !startTime.isValid() ? ago : startTime;
    const _e: moment.Moment = !endTime.isValid() ? moment() : endTime;
    const scope: string = _.trim(ctx.request.query.scope || '');
    const scopeName: string = _.trim(ctx.request.query.scopeName || '');
    const env: string = _.trim(ctx.request.query.env || '');
    const logPath: string = _.trim(ctx.request.query.logPath || '');
    const ip: string = _.trim(ctx.request.query.ip || '');
    const keyword: string = _.trim(ctx.request.query.keyword) || '';
    const pageSize: number = parseInt(ctx.request.query.pageSize, 10);
    const page: number = parseInt(ctx.request.query.page, 10);
    const ets: string = ctx.request.query.errType;
    const options: Interface.QueryErrorOptions = {
      startTime: _s.valueOf(),
      endTime: _e.valueOf(),
      errType: (_.includes(ets, ',') ? (ets || '').split(',') : (ets ? [ets] : [])),
      scope, scopeName, env,
      logPath, ip, keyword, pageSize, page,
    };
    this.logger.info('[Controller:queryErrors:options]', options);
    try {
      ctx.body = _.extend({success: true}, {data: await this.errorServ.queryErrors(options)});
    } catch (e) {
      e.name = 'GetSLSLogError';
      ctx.body = {success: false, error: e, data: null};
    }
  }

  @get('/queryErrorTypes')
  async queryErrorTypes(ctx) {

    const startTimeRaw: string = ctx.request.query.startTime;
    const endTimeRaw: string = ctx.request.query.endTime;
    const startTimeRaw2nd: string | moment.Moment = moment(startTimeRaw).isValid()
      ? startTimeRaw : moment().subtract(15, 'minutes');
    const endTimeRaw2nd: string | moment.Moment = moment(endTimeRaw).isValid() ? endTimeRaw : moment();
    const startTime: number = moment(startTimeRaw2nd).valueOf();
    const endTime: number = moment(endTimeRaw2nd).valueOf();
    const scope: string = _.trim(ctx.request.query.scope || '');
    const scopeName: string = _.trim(ctx.request.query.scopeName || '');
    const env: string = _.trim(ctx.request.query.env || '');
    const options: Interface.QueryErrorOptions = {
      startTime, endTime, scope, scopeName, env,
    };
    const data = await this.errorServ.queryErrorTypes(options);
    ctx.body = {
      success: true,
      data,
    };

  }
}
