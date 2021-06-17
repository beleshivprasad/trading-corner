import sys
def test1(ticker,folder):
    import tensorflow.keras.models as md
    import numpy as np
    import pandas as pd
    import pandas_datareader as web
    import datetime as dt
    from sklearn.preprocessing import MinMaxScaler
    prediction_day = 60
    # get the data
    start = dt.datetime(2012, 1, 1)
    end = dt.datetime(2021, 1, 1)
    data = web.DataReader(ticker, 'yahoo', start, end)
    # Creating the scaler
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data['Close'].values.reshape(-1, 1))

    # preparing data
    test_start = dt.datetime(2021, 1, 1)
    test_end = dt.datetime.now()
    test_data = web.DataReader(ticker, 'yahoo', test_start, test_end)
    actual_prices = test_data['Close'].values
    total_dataset = pd.concat((data['Close'], test_data['Close']))
    model_inputs = total_dataset[len(total_dataset) - len(test_data) - prediction_day:].values
    model_inputs = model_inputs.reshape(-1, 1)
    model_inputs = scaler.transform(model_inputs)

    # Predict Next Day
    real_data = [model_inputs[len(model_inputs) + 1 - prediction_day:len(model_inputs + 1), 0]]
    real_data = np.array(real_data)
    real_data = np.reshape(real_data, (real_data.shape[0], real_data.shape[1], 1))

    # Loading the model
    model = md.load_model(f"./MODELS/{folder}/train_1.h5")
    prediction = model.predict(real_data)
    prediction = scaler.inverse_transform(prediction)
    # print(prediction[0][0])
    return prediction[0][0]

def test2(ticker,folder):
    import joblib
    import pandas_datareader as web
    import datetime as dt

    # get the data
    start = dt.datetime(2012, 1, 1)
    end = dt.datetime.now()
    data = web.DataReader(ticker, 'yahoo', start, end)
    # print(data.head(-1))
    # print(len(data))

    rbf_svr = joblib.load(f"./MODELS/{folder}/train_2.pkl")
    pred=rbf_svr.predict([[len(data) + 1]])
    # print(pred[0])
    return pred[0]


def prediction():
    ticker=sys.argv[1]
    folder=sys.argv[2]
    tot=0
    tot += test1(ticker, folder)
    tot += test2(ticker, folder)
    print(tot / 2)

prediction()


