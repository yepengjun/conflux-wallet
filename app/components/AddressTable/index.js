/**
 *
 * AddressTable
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Table, Button, Row } from 'antd';
import BigNumber from 'bignumber.js';

// import CurrencyDropdown from 'components/CurrencyDropdown';
// import TokenIcon from 'components/TokenIcon';
import MobileAddressTable from 'components/MobileAddressTable';
// import { tokenName } from 'utils/constants';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

// import CurrencyDropdown from 'components/CurrencyDropdown';
import TokenIcon from 'components/TokenIcon';
import messages from './messages';

const { Column } = Table;

const AddrTable = styled(Table)`
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 30px;
  tbody {
    background: white;
  }
  .ant-table {
    font-size: 13px !important;
  }
  .ant-table-thead > tr > th {
    border: none;
    background: #f0f0f0;
    font-size: 18px;
    color: #333;
  }
  .ant-table-tbody > tr > td {
    font-size: 14px;
    color: #666;
  }
  .ant-table-thead > tr > th[colspan] {
    text-align: left;
    font-size: 18px;
    color: #333;
  }
`;

/**
 * Create list of rows, one row per token for given address
 * @param  {object} tokenDecimalsMap
 * @param  {object} tokenMapIN
 * @param  {string} address current address
 * @param  {number} startKey the first key of the given address
 *
 * @return {object[]} array as rows, one row per token/address
 * row:
{
  key: '1',
  index: '1',
  token: 'eth',
  address: '13c...9d06',
  balance: '3',
  convert: '',
} */
const splitAddrToRows = (tokenDecimalsMap, tokenMapIN, address, startKey) => {
  const key = startKey;
  const tokenMap = tokenMapIN;
  const index = tokenMap.index;
  delete tokenMap.index;

  const balance = tokenMap.cfx.balance;
  const decimals = tokenDecimalsMap.cfx;

  // 只有单币种
  return [
    {
      index,
      key,
      token: 'cfx',
      address,
      balance: balance
        ? new BigNumber(balance).div((10 ** decimals).toString()).toString(10)
        : 'n/a',
      decimals,
    },
  ];

  // return Object.keys(tokenMap).map((token) => {
  //   const sameAddressRow = {};
  //   sameAddressRow.index = index;
  //   sameAddressRow.key = key;
  //   key += 1;
  //   sameAddressRow.token = token;
  //   sameAddressRow.address = address;
  //   const balance = tokenMap[token].balance;
  //   const decimals = tokenDecimalsMap[token];
  //   sameAddressRow.balance = balance
  //     ? balance.div((10 ** decimals).toString()).toString(10)
  //     : 'n/a';
  //   // sameAddressRow.convert = '';
  //   return sameAddressRow;
  // });
};

/**
 * Transforms addressMap into Array of rows
 * @param  {object} addressMap
 * @param  {object} tokenDecimalsMap number of decimal for each currency
 * @param  {boolean} showTokens should show token in the table
 * return example: addressArray =
  [{{
    key: '1',
    index: '1',
    token: 'eth',
    address: '13c...9d06',
    balance: '3',
    convert: '200 USD',
  },
    key: '2',
    index: '1',
    token: 'eos',
    address: '13c...9d06',
    balance: '3',
    convert: '15 USD',
  }, {
    key: '3',
    index: '1',
    token: 'ppt',
    address: '13c...9d06',
    balance: '3',
    convert: '13 USD',
  },
] */
const transformList = (addressMap, tokenDecimalsMap) => {
  //eslint-disable-line
  // const showTokens = true;
  let iKey = 1;

  const list = Object.keys(addressMap).map((address) => {
    const tokenMap = addressMap[address];
    const sameAddressList = splitAddrToRows(tokenDecimalsMap, tokenMap, address, iKey);

    iKey += sameAddressList.length;
    return sameAddressList;
  });
  return [].concat(...list); // flaten array
};

/**
 * return conversion rate from given token
 * @param  {object} exchangeRates available exchange rates
 * @param  {string} from symbol to convert from: 'eth' / 'usd' / ..
 * @param  {string} to the convertion pair to use: ie "eth_usd"
 *
 * @return {Array} array as data for table, see example above
 */
const getConvertRate = (exchangeRates, from, to) => {
  const fromKey = `cfx_${from}`;
  // convert token to cfx by invert(eth_token)
  const toEthRate = exchangeRates[fromKey].rate.toPower(-1);
  const toTokenRate = exchangeRates[to].rate;
  return toEthRate && toTokenRate && toEthRate.times(toTokenRate);
};

/**
 * Add converted rates to all rows
 * adds nothing if exchange rate not found
 * @param  {object[]} rowList table rows contains balance
 * @param  {object} exchangeRates all available exchange rates
 * @param  {string} convertTo the convertion pair to use: ie "eth_usd"
 *
 * @return {Array} array as data for table, see example above
 */
const addConvertRates = (rowList, exchangeRates, convertTo) =>
  rowList.map((row) => {
    try {
      // const convertToSymbol = convertTo.slice(4).toUpperCase();
      if (`eth_${row.token}` === convertTo) {
        row.convert = row.balance; // eslint-disable-line
      } else {
        const convertRate = getConvertRate(exchangeRates, row.token, convertTo);
        row.convert = convertRate
          .times(row.balance)
          .round(5)
          .toString(10); // eslint-disable-line
      }
      return row;
    } catch (err) {
      // no rates found
      return row;
    }
  });

function AddressTable(props) {
  const {
    addressMap,
    tokenDecimalsMap,
    onShowSendToken,
    exchangeRates,
    // onSelectCurrency,
    convertTo,
    onShowDeployContract,
    intl,
  } = props;

  // const currencyDropdownProps = { exchangeRates, onSelectCurrency, convertTo };

  const rowList = transformList(addressMap, tokenDecimalsMap, true);
  const completeRowList = addConvertRates(rowList, exchangeRates, convertTo);

  return (
    <div>
      {!global.isMobile ? (
        <AddrTable
          dataSource={completeRowList}
          // bordered
          // scroll={{ x: 1200 }}
          pagination={false}
        >
          <Column
            title={intl.formatMessage({ ...messages.address })}
            dataIndex="address"
            key="address"
            // width="267px"
            // className="columnCenter"
            render={(text, record) => {
              const obj = {
                children: text,
                props: {},
              };
              // if (record.token !== 'cfx') {
              //   // obj.props.rowSpan = 0;
              //   obj.props.rowSpan = 0;
              //   // obj.children = '~';
              // } else {
              //   obj.props.rowSpan = Object.keys(tokenDecimalsMap).length || 2;
              // }
              return obj;
            }}
          />
          {/* <Column
            title="#"
            dataIndex="key"
            key="key"
            width="10px"
            sorter={(a, b) => parseInt(a.key, 10) - parseInt(b.key, 10)}
            sortOrder="ascend"
            className="columnCenter"
          /> */}
          {/* <Column
            title="Icon"
            key="Icon"
            width="12px"
            render={(text, record) => <TokenIcon tokenSymbol={record.token} />}
            className="columnCenter"
          /> */}

          {/* <Column
            title="Token"
            dataIndex="token"
            key="token"
            width="65px"
            className="columnCenter"
            render={(text, record) => record.token.toUpperCase()}
          /> */}
          <Column
            title={intl.formatMessage({ ...messages.balance })}
            dataIndex="balance"
            key="balance"
            // width="80px"
            // filters={[
            //   {
            //     text: 'Remove empty',
            //     value: '0 CFX',
            //   },
            // ]}
            // onFilter={(value, record) => record.balance !== value}
          />
          <Column
            // width="65px"
            title={intl.formatMessage({ ...messages.action })}
            key="action"
            render={(text, record) => (
              <div>
                <Button
                  type="primary"
                  ghost
                  onClick={() => onShowSendToken(record.address, record.token)}
                >
                  <FormattedMessage {...messages.send} />
                </Button>
                <Button
                  type="primary"
                  ghost
                  onClick={() => onShowDeployContract(record.address)}
                  style={{ marginLeft: 10 }}
                >
                  <FormattedMessage {...messages.deployContract} />
                </Button>
              </div>
            )}
          />
        </AddrTable>
      ) : (
        <MobileAddressTable data={completeRowList} {...props} />
      )}
    </div>
  );
}

AddressTable.propTypes = {
  addressMap: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  tokenDecimalsMap: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  onShowSendToken: PropTypes.func,
  exchangeRates: PropTypes.object,
  // onSelectCurrency: PropTypes.func,
  convertTo: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  onShowDeployContract: PropTypes.func,
  intl: intlShape.isRequired,
};

export default injectIntl(AddressTable);
