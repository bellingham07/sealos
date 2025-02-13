import { AxiosRequestConfig } from 'axios';

export const monitorFetch = async (props: AxiosRequestConfig, kubeconfig: string) => {
  const { url, params } = props;
  const queryString = new URLSearchParams(params).toString();
  const requestOptions = {
    method: 'GET',
    headers: {
      Authorization: encodeURIComponent(kubeconfig)
    }
  };
  const doMain = process.env.MONITOR_URL || 'http://monitor-system.cloud.sealos.run';
  const response = await fetch(`${doMain}${url}?${queryString}`, requestOptions).then((res) =>
    res.json()
  );
  return response;
};
