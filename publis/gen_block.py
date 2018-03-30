
# coding: utf-8

# In[8]:


fmt="""
			<div class="pure-g" id="{id_}thumb">
				<div class="pure-u-1 pure-u-lg-1-2">
					<div class="card abstract-box">
						<div class="info">
							<h2><a href="{url}">
									{title}
								</a></h2>
								<div class="authors">
									<a href="http://geraud.so">Géraud Le Falher</a>
								</div>
								<div class="links">
									[&nbsp;<a href="{url}"></a>&nbsp;|
									&nbsp;<a href="publis.html_bib.html#{id_}">bib</a>&nbsp;]
								</div>
						</div>
						<div class="abstract">
							<a class="paperThumbnail" title="{title}"
								href="{url}">
							</a>
							<p>
							{abs}
							</p>
						</div>
					</div>
				</div>

				<div class="pure-u-1 pure-u-lg-1-2">
					<div class="card gallery">
						<figure>
							<img src="{id_}_fig_full.png">
							<figcaption>
							<span class="lead">{caption}</span>
							</figcaption>
						</figure>
					</div>
				</div>
                
			</div>
"""


# In[6]:


print(fmt.format(**dict(id_="LFGM15", url="http://www.aaai.org/ocs/index.php/ICWSM/ICWSM15/paper/view/10514", 
                title="Where Is the Soho of Rome? Measures and Algorithms for Finding Similar Neighborhoods in Cities", 
                abs="data", caption="A query in Washington and its result in New-York")))


# In[10]:


print(fmt.format(**dict(id_="GeotopicsJournal16", url="http://mmathioudakis.github.io/geotopics/", 
                title="Modeling urban behavior by mining geotagged social data", 
                abs="Data generated on location-based social networks provide rich information on the whereabouts of urban dwellers. Specifically, such data reveal who spends time where, when, and on what type of activity (e.g., shopping at a mall, or dining at a restaurant). That information can, in turn, be used to describe city regions in terms of activity that takes place therein. For example, the data might reveal that citizens visit one region mainly for shopping in the morning, while another for dining in the evening. Furthermore, once such a description is available, one can ask more elaborate questions: What are the features that distinguish one region from another -- is it simply the type of venues they host or is it the visitors they attract? What regions are similar across cities? ", 
                        caption="FIG.3 Most likely category and checkin time of day, day of week across Manhattan. The transparency of each point is proportional to the probability that a venue is located at that point. ")))


# In[11]:


print(fmt.format(**dict(id_="trollNips16", url="http://arxiv.org/abs/1602.08986", 
                title="On the Troll-Trust Model for Edge Sign Prediction in Social Networks", 
                abs="In the problem of edge sign classification, we are given a directed graph (representing an online social network), and our task is to predict the binary labels of the edges (i.e., the positive or negative nature of the social relationships). Many successful heuristics for this problem are based on the troll-trust features, estimating on each node the fraction of outgoing and incoming positive edges. We show that these heuristics can be understood, and rigorously analyzed, as approximators to the Bayes optimal classifier for a simple probabilistic model of the edge labels. We then show that the maximum likelihood estimator of this model approximately corresponds to the predictions of a label propagation algorithm run on a transformed version of the original social graph. Extensive experiments on a number of real-world datasets show that this algorithm is competitive against state-of-the-art classifiers in terms of both prediction performance and scalability. Finally, we show that troll-trust features can also be used to derive online learning algorithms which have theoretical guarantees even when edges are adversarially labeled.", 
                        caption="{\bf (a)} A directed edge-labeled graph $G$. {\bf (b)} Its corresponding graph $G'$ resulting from the $G\rightarrow G'$ reduction. The square nodes in $G'$ correspond to the edges in $G$, and carry the same labels as their corresponding edges. On the other hand, the $2|V|$ circle nodes in $G'$ are unlabeled. Observe that some nodes in $G'$ are isolated (and thus disregardable); these are exactly the nodes in $G'$ corresponding to the nodes having in $G$ no outgoing or no incoming edges, see, e.g., nodes $3$ and $4$ in $G$. {\bf (c)} The weighted graph resulting from the $G\rightarrow G''$ reduction.")))

