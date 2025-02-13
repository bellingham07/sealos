import { authSession } from '@/service/backend/auth';
import { ApplyYaml, CRDMeta, GetCRD, GetUserDefaultNameSpace } from '@/service/backend/kubernetes';
import { jsonRes } from '@/service/backend/response';
import { enableRecharge } from '@/service/enabled';
import * as yaml from 'js-yaml';
import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  try {
    if (!enableRecharge) {
      throw new Error('recharge is not enabled');
    }
    const kc = await authSession(req.headers);
    const user = kc.getCurrentUser();
    if (user === null) {
      return jsonRes(resp, { code: 403, message: 'user null' });
    }
    const namespace = kc.getContexts()[0].namespace || GetUserDefaultNameSpace(user.name);
    const name = new Date().getTime() + 'bonusquery';
    const crdSchema = {
      apiVersion: `account.sealos.io/v1`,
      kind: 'BillingInfoQuery',
      metadata: {
        name,
        namespace
      },
      spec: {
        queryType: 'Recharge'
      }
    };
    const meta: CRDMeta = {
      group: 'account.sealos.io',
      version: 'v1',
      namespace,
      plural: 'billinginfoqueries'
    };
    const result1 = await ApplyYaml(kc, yaml.dump(crdSchema));
    const result = await new Promise<{
      discountRates: number[];
      discountSteps: number[];
      specialDiscount: Record<string, number>;
    }>((resolve, reject) => {
      let retry = 3;
      const wrap = () =>
        GetCRD(kc, meta, name)
          .then((res) => {
            const body = res.body as { status: any };
            const { result, status } = body.status as Record<string, string>;
            if (status.toLocaleLowerCase() === 'completed') resolve(JSON.parse(result));
            else return Promise.reject();
          })
          .catch((err) => {
            if (retry-- >= 0) wrap();
            else reject(err);
          });
      wrap();
    });
    return jsonRes(resp, {
      code: 200,
      data: {
        ratios: result.discountRates,
        steps: result.discountSteps,
        specialDiscount: Object.entries(result.specialDiscount || {}).map<[number, number]>(
          ([k, v]) => [+k, v]
        )
      }
    });
  } catch (error) {
    console.log(error);
    jsonRes(resp, { code: 500, message: 'get price error' });
  }
}
