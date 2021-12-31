# from requests_html import HTMLSession
# session = HTMLSession()
#
# url = "https://news.google.com/rss/search?q=howard-university&hl=en-US&gl=US&ceid=US:en"
# s = HTMLSession()
#
# r = s.get(url)
#
# for title in r.html.find('title'):
#     print(title.text)
import sys

import newsscraper

with newsscraper.Scraper(sys.argv) as scraper:
   driver = scraper.get_chrome()
   driver.get('https://stackoverflow.com/questions')
   for question in driver.find_elements_by_xpath('//a[@class="question-hyperlink"]'):
       scraper.add(question.get_attribute('href'), question.text)
