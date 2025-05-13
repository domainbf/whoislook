import { connect } from 'net';

export async function whois(domain: string): Promise<string> {
  const queryServer = (server: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const client = connect({ host: server, port: 43, timeout: 5000 });
      let response = '';

      client
        .on('connect', () => client.write(`${domain}\r\n`))
        .on('data', (data) => {
          response += data.toString();
        })
        .on('end', () => resolve(response))
        .on('error', (err) => {
          client.destroy();
          reject(new Error(`Query to ${server} failed: ${err.message}`));
        });
    });
  };

  try {
    const ianaResponse = await queryServer('whois.iana.org');
    const referralMatch = ianaResponse.match(/refer:\s+([^\s]+)/);

    if (!referralMatch) {
      throw new Error('No referral WHOIS server available for this domain.');
    }

    const referralServer = referralMatch[1].trim();
    return await queryServer(referralServer);
  } catch (error) {
    throw new Error(`WHOIS lookup failed: ${error.message}`);
  }
}
