const hexAsBuffer = (hex) => (!!hex ? Buffer.from(hex, "hex") : undefined);

function convertBuffers(obj, key) {
  if (Array.isArray(obj)) {
    return obj.map(convertBuffers);
  } else if (typeof obj === "object" && obj) {
    if (Buffer.isBuffer(obj)) {
      const buffer = Buffer.from(obj);
      return buffer.toString("hex");
    } else {
      const result = {};
      Object.keys(obj).forEach((key) => {
        result[key] = convertBuffers(obj[key], key);
      });
      return result;
    }

  } else {
    return obj;
  }
}

module.exports = (args) => {
  return new Promise((resolve, reject) => {
    if (!args.tpr) {
      reject(new Error('ExpectedAuthenticatedLndToMakePayment'));
    }
    if (!args.asset_id) {
      reject(new Error('ExpectedAssetIdToMakePayment'));
    }

    if (!args.asset_amount) {
      reject(new Error('ExpectedAssetAmountToMakePayment'));
    }
    if (!args.peer_pubkey) {
      reject(new Error('ExpectedPeerPubkeyToMakePayment'));
    }
    if (!args.payment_request) {
      reject(new Error('ExpectedPaymentRequestToMakePayment'));
    }
    const callRequest = {
      asset_id: hexAsBuffer(args.asset_id),
      asset_amount: args.asset_amount,
      peer_pubkey: hexAsBuffer(args.peer_pubkey),
      payment_request: args.payment_request,
    }
    const sub = args.tpr.taproot_asset_channels.sendPayment(callRequest);
    const ret = {
      payment_result: null,
      failure_reason: null,
      assepted_sell_order: null,
    }
    sub.on('data', response => {
      if (response?.accepted_sell_order) {
        ret.assepted_sell_order = response.accepted_sell_order
      }
      if (response?.payment_result) {
        ret.payment_result = response?.payment_result;
      }

    });
    sub.on("status", function (status) {
      if (status == 6) {
        ret.failure_reason = status.details;
        reject(new Error(status?.details))
      }
    });
    sub.on('error', err => {
      if (err?.details.indexOf("EOF") === -1) {
        ret.failure_reason = err?.details;
        reject(new Error(err?.details))
      }
    });
    sub.on('end', () => {
      sub.removeAllListeners();
      resolve(convertBuffers(ret))
    });

  });
};
