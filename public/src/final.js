var Comment = React.createClass({
    clickDelete: function(e){
        e.preventDefault();
        console.log("Calling delete comment");
        this.props.deleteHandler(2);
    },
    render: function() {
        return (
            <div className="comment">
                <div className="clearfix">
                    <h4 className="commentAuthor pull-left">{this.props.author}</h4>
                    <a className="btn btn-sm btn-danger pull-right" onClick={this.clickDelete}>Delete</a>
                </div>
                <p>{this.props.children}</p>
                <hr />
            </div>
        );
    }
});

var CommentList = React.createClass({
    deleteComment: function(id) {
        console.log("Calling delete comment with id: " + id);
        this.props.onDeleteComment(id);
    },
    render: function() {
        var commentNodes = this.props.data.map(function (comment, i) {
            return (
                <Comment author={comment.author} deleteHandler={this.deleteComment} key={i}>
                    {comment.comment}
                </Comment>
            );
        });
        return (
            <div className="commentList">
                {commentNodes}
            </div>
        );
    }
});

var CommentForm = React.createClass({
    handleSubmit: function(e) {
        e.preventDefault();
        var author = React.findDOMNode(this.refs.author).value.trim();
        var text = React.findDOMNode(this.refs.text).value.trim();
        if (!text || !author) {
            return;
        }
        // TODO: send request to the server
        this.props.onCommentSubmit({author: author, text: text, _token: App.token});

        React.findDOMNode(this.refs.author).value = '';
        React.findDOMNode(this.refs.text).value = '';
        return;
    },
    render: function() {
        return (
            <div>
                <hr />
                <form className="commentForm form-inline" onSubmit={this.handleSubmit}>
                    <input className="form-control" type="text" placeholder="Your name" ref="author" />
                    <input className="form-control" type="text" placeholder="Say something..." ref="text"/>
                    <input className="btn btn-success" type="submit" value="Post" />
                </form>
            </div>
        );
    }
});

var CommentBox = React.createClass({
    handleDeleteComment: function(id){
        console.log("Deleting this comment");
        $.ajax({
            url: this.props.url,
            type: 'DELETE',
            dataType: 'json',
            cache: false,
            data: id,
            success: function(data) {
                console.log("Deleted successfully!");
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("URL: " + this.props.url, "Status: " + status, "Error: " + err.toString());
            }.bind(this)
        });
    },
    loadCommentsFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("URL: " + this.props.url, "Status: " + status, "Error: " + err.toString());
            }.bind(this)
        });
    },
    getInitialState: function(){
        return {data: []}
    },
    handleCommentSubmit: function(comment) {
        var comments = this.state.data;
        var newComments = comments.concat([comment]);
        this.setState({data: newComments});
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <hr />
                <CommentList data={this.state.data} onDeleteComment={this.handleDeleteComment}/>
                <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
            </div>
        );
    }
});


React.render(
<CommentBox url={App.commentUrl} pollInterval={20000}/>,
    document.getElementById('content')
);