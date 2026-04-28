from scipy.sparse import csr_matrix

book_features_df_matrix = csr_matrix(book_features_df.values)

from sklearn.neighbors import NearestNeighbors


model_knn = NearestNeighbors(metric = 'cosine', algorithm = 'brute')
model_knn.fit(book_features_df_matrix)

query_index = np.random.choice(book_features_df.shape[0])
print(query_index)
distances, indices = model_knn.kneighbors(book_features_df.iloc[query_index,:].values.reshape(1, -1), n_neighbors = 6)

for i in range(0, len(distances.flatten())):
    if i == 0:
        print('Recommendations for {0}:\n'.format(book_features_df.index[query_index]))
    else:
        print('{0}: {1}, with distance of {2}:'.format(i, book_features_df.index[indices.flatten()[i]], distances.flatten()[i]))

