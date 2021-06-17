def train_1(ticker,folder):
    import numpy as np
    import pandas_datareader as web
    import datetime as dt
    from sklearn.preprocessing import MinMaxScaler
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Dense,Dropout, LSTM

    # get the data
    start = dt.datetime(2012, 1, 1)
    end = dt.datetime(2021, 1, 1)

    data = web.DataReader(ticker, 'yahoo', start, end)
    print(len(data))

    # prepare the data
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data['Close'].values.reshape(-1, 1))
    prediction_day = 60
    x_train = []
    y_train = []
    for x in range(prediction_day, len(scaled_data)):
        x_train.append(scaled_data[x - prediction_day:x, 0])
        y_train.append(scaled_data[x, 0])
    x_train, y_train = np.array(x_train), np.array(y_train)
    x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1], 1))

    # Build the model
    model = Sequential()
    
    model = Sequential()
    model.add(LSTM(100, return_sequences=True, input_shape=(x_train.shape[1], 1)))
    model.add(LSTM(100, return_sequences=False))
    model.add(Dense(50))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mean_squared_error')
    model.fit(x_train, y_train, batch_size=25, epochs=100)

    model.save(f"./MODELS/{folder}/train_1.h5")
    print("LSTM Done")


def train_2(ticker,folder):
    from sklearn.svm import SVR
    import joblib
    import pandas_datareader as web
    import datetime as dt

    # get the data
    start = dt.datetime(2012, 1, 1)
    end = dt.datetime.now()
    data = web.DataReader(ticker, 'yahoo', start, end)
    # print(data.head(-1))
    print(len(data))

    # prepare data
    close_price = []
    days = []
    for i in data['Close'].values:
        # print(i)
        close_price.append(float(i))

    for i in range(1, len(close_price) + 1):
        days.append([i])

    print(close_price)
    print(days)

    # #creating the models
    rbf_svr = SVR(kernel='rbf', C=10000, gamma=0.01)
    rbf_svr.fit(days, close_price)
    file = f"./MODELS/{folder}/train_2.pkl"
    joblib.dump(rbf_svr, file)
    print("SVM Done")
    print(rbf_svr.predict([[len(data) + 1]]))

def training():
    ticker='ICICIBANK.NS'
    folder='adani'
    train_1(ticker,folder)
    train_2(ticker,folder)
    print("Done Training")

training()
