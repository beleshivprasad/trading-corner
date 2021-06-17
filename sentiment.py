import sys
from urllib.request import urlopen, Request
from bs4 import BeautifulSoup
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.util import pr

def getsentiment(ticker):
    news_tables = {}
    url = f"https://www.google.com/finance/quote/{ticker}"

    req = Request(url=url, headers={'user-agent': 'my-app'})
    response = urlopen(req)

    html = BeautifulSoup(response, features='html.parser')
    news_table = html.html.find_all("div",class_="AoCdqe")
    # print(news_table)
    news_tables[ticker] = news_table

    # print(news_tables)
    tot_pos=0
    tot_neu=0
    tot_neg=0
    # result=[]
    news_list=list(news_tables[f"{ticker}"])
    for i in news_list:
        vader = SentimentIntensityAnalyzer()
        data=vader.polarity_scores(i.text)
        tot_pos+=data['pos']
        tot_neg+=data['neg']
        tot_neu+=data['neu']
    print(f"{round((tot_pos/len(news_list))*100,1)},{round((tot_neg/len(news_list))*100,1)},{round((tot_neu/len(news_list))*100,1)}")
    # result.append(round((tot_pos/len(news_list))*100,1))
    # result.append(round((tot_neg/len(news_list))*100,1))
    # result.append(round((tot_neu/len(news_list))*100,1))
    # print(result)

getsentiment(sys.argv[1])