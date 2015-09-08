var Comment = React.createClass({displayName: "Comment",
    clickDelete: function(e){
        e.preventDefault();
        console.log("Calling delete comment");
        this.props.deleteHandler(2);
    },
    render: function() {
        return (
            React.createElement("div", {className: "comment"}, 
                React.createElement("div", {className: "clearfix"}, 
                    React.createElement("h4", {className: "commentAuthor pull-left"}, this.props.author), 
                    React.createElement("a", {className: "btn btn-sm btn-danger pull-right", onClick: this.clickDelete}, "Delete")
                ), 
                React.createElement("p", null, this.props.children), 
                React.createElement("hr", null)
            )
        );
    }
});

var CommentList = React.createClass({displayName: "CommentList",
    deleteComment: function(id) {
        console.log("Calling delete comment with id: " + id);
        this.props.onDeleteComment(id);
    },
    render: function() {
        var commentNodes = this.props.data.map(function (comment, i) {
            return (
                React.createElement(Comment, {author: comment.author, deleteHandler: this.deleteComment, key: i}, 
                    comment.comment
                )
            );
        });
        return (
            React.createElement("div", {className: "commentList"}, 
                commentNodes
            )
        );
    }
});

var CommentForm = React.createClass({displayName: "CommentForm",
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
            React.createElement("div", null, 
                React.createElement("hr", null), 
                React.createElement("form", {className: "commentForm form-inline", onSubmit: this.handleSubmit}, 
                    React.createElement("input", {className: "form-control", type: "text", placeholder: "Your name", ref: "author"}), 
                    React.createElement("input", {className: "form-control", type: "text", placeholder: "Say something...", ref: "text"}), 
                    React.createElement("input", {className: "btn btn-success", type: "submit", value: "Post"})
                )
            )
        );
    }
});

var CommentBox = React.createClass({displayName: "CommentBox",
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
            React.createElement("div", {className: "commentBox"}, 
                React.createElement("h1", null, "Comments"), 
                React.createElement("hr", null), 
                React.createElement(CommentList, {data: this.state.data, onDeleteComment: this.handleDeleteComment}), 
                React.createElement(CommentForm, {onCommentSubmit: this.handleCommentSubmit})
            )
        );
    }
});


React.render(
React.createElement(CommentBox, {url: App.commentUrl, pollInterval: 20000}),
    document.getElementById('content')
);