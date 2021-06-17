import pandas_datareader as web
import datetime as dt
ticker='SBIN.NS'
start = dt.datetime(2012, 1, 1)
end = dt.datetime(2021, 1, 1)

data = web.DataReader(ticker, 'yahoo', start, end)
print(data)