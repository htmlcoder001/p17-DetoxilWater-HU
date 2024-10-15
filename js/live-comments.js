$( document ).ready(function() {

    const withForm = true;


    const commentsWraps = document.querySelectorAll('.comments-wrap');

    const imageInputs = document.querySelectorAll('.image-input');

    let userImageDataUrl = localStorage.getItem('user-image');

    function updateImageSrc() {
        const userPictures = document.querySelectorAll('.user-picture-to-load');
        userPictures.forEach((img) => {
            userImageDataUrl ? img.setAttribute('src', userImageDataUrl) : img.setAttribute('src', 'images/profile.svg');
        });
    }


    const imageInputEventListener = (arr) => {
        arr.forEach(elem =>{
            elem.addEventListener('change', () => {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(elem.files[0]);

                fileReader.addEventListener('load', () => {
                    userImageDataUrl = fileReader.result;
                    localStorage.setItem('user-image', userImageDataUrl);
                    updateImageSrc();
                });
            });
        })

    }
    imageInputEventListener(imageInputs);


    // ====================================TAKE IMAGE AND LOAD IT TO LOCAL STORAGE


    document.addEventListener('DOMContentLoaded', () => {
        if (userImageDataUrl) {
            updateImageSrc();
        }
    });


    // ====================================COMMENTS TYPE ABILITY

    let commentsData = (commentsId) => JSON.parse(localStorage.getItem('commentsData' + commentsId) || '[]');
    let repliesData = (commentsId) => JSON.parse(localStorage.getItem('repliesData' + commentsId) || '[]');



    const displayComment = (name, text, container, isReply = false, commentsWrap) => {
        // const commentsWrapper = commentsWrap;
        let commentLayout;
        const commentLayoutNew = commentsWrap.querySelector('.comment-layout').cloneNode(true);
        const commentLayoutAnswer = commentsWrap.querySelector('.comment-layout .comment').cloneNode(true);
        const createCommentElement = commentsWrap.querySelector('.comment-add-block');


        if (isReply) {
            commentLayout = commentLayoutAnswer;
            commentLayout.classList.add('comment--answer');
        } else {
            commentLayout = commentLayoutNew;
            commentLayout.classList.add('just-typed');
            commentLayout.classList.add('comment-layout');
        }


        userImageDataUrl ? commentLayout.querySelector(".layout-user-pic").setAttribute("src", userImageDataUrl) : commentLayout.querySelector(".layout-user-pic").setAttribute("src", 'images/profile.svg');
        updateImageSrc();


        // const emojiBox = commentLayout.querySelector(".emoji-box");


        const commentLikes = commentLayout.querySelector(".layout-comment-likes");
        const commentTime = commentLayout.querySelector(".comment-time");
        commentLikes ? commentLikes.innerText = '0' : '';
        commentTime ? commentTime.innerText = 'most' : '';
        // commentLayout.querySelector(".user-name").innerText = name;
        // commentLayout.querySelector(".typed-text").innerText = text;
        // emojiBox.style.display = "none";

        commentLayout.querySelector(".user-name").innerText = name;
        commentLayout.querySelector(".typed-text").innerText = text;
        commentLayout.querySelector('.comment__ui-item:first-child').style.display = 'none';
        commentLayout.classList.remove('comment-layout');
        commentLayout.querySelector('.comment__text').classList.remove('typed-text');

        if (isReply) {
            container.appendChild(commentLayout);
            container.querySelector('.comment-add-block') ? container.querySelector('.comment-add-block').remove() : "";
        } else {
            function generateUniqueID() {
                return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
            }

            commentLayout.setAttribute("data-id-g", generateUniqueID());
            commentsWrap.insertBefore(commentLayout, createCommentElement.nextSibling);
        }
    };

    commentsWraps.forEach(elem => {
        const id = elem.getAttribute('data-comment-block-id');
        for (const comment of commentsData(id)) {
            // const commentsWrapper = commentsWrapper.querySelector('.comments-wrap');
            displayComment(comment.name, comment.text, false, false, elem);
        }
    })

    commentsWraps.forEach(elem => {
        const id = elem.getAttribute('data-comment-block-id');

        for (const reply of repliesData(id)) {
            const commentWrap = elem.querySelector(`.comment-wrap[data-id-g="${reply.parentId}"]`);
            displayComment(reply.name, reply.text, commentWrap, true, elem);
        }
    })




    const postComment = (nameInput, textInput, isReply = false, parentId = null, commentWrap, wrapId) => {

        const commentsCounters = document.querySelectorAll('.comments-count');

        commentsCounters.forEach(item => {
            const commentsCount = item.innerHTML;
            item.innerHTML = Number(commentsCount) + 1;
        });


        const comment = {
            name: nameInput.value,
            text: textInput.value
        };

        if (comment.name.length > 2 && comment.text.length > 2) {
            const container = isReply
                ? commentWrap.querySelector(`.comment-wrap[data-id-g="${parentId}"]`)
                : commentWrap;

            displayComment(comment.name, comment.text, container, isReply, commentWrap);

            if (isReply) {
                const newArray = repliesData(wrapId);
                comment.parentId = parentId;
                newArray.push(comment);
                // repliesData(wrapId).push(comment);
                localStorage.setItem('repliesData' + wrapId, JSON.stringify(newArray));
            } else {
                const newArray = commentsData(wrapId);
                // commentsData(wrapId).push(comment);
                newArray.push(comment);
                localStorage.setItem('commentsData' + wrapId, JSON.stringify(newArray));

                if (withForm) {
                    var scrollbar = $('body').width() - $(window).width() + 'px';
                    $('#openModal').css('marginLeft', scrollbar);
                    $('#openModal').addClass('open');
                }

            }

            nameInput.value = "";
            textInput.value = "";
        }

    };

    document.querySelectorAll('[name="user-comment"]').forEach(textComment => {
            textComment.addEventListener('keypress', (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    const nameInput = textComment.closest('.comment-add-block').querySelector('[name="user-name"]');
                    const wrapper = textComment.closest('.comments-wrap');
                    const wrapperId = wrapper.getAttribute('data-comment-block-id');
                    postComment(nameInput, textComment, false, null, wrapper, wrapperId);
                }
            });
        }
    )
    document.querySelectorAll('.comment-create__create-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const nameInput = button.closest('.comment-add-block').querySelector('[name="user-name"]');
            const wrapper = button.closest('.comments-wrap');
            const textComment = wrapper.querySelector('[name="user-comment"]');
            const wrapperId = wrapper.getAttribute('data-comment-block-id');
            postComment(nameInput, textComment, false, null, wrapper, wrapperId);
        });
    })
    // document.querySelector('.comment-create__create-btn').addEventListener('click', () => {
    //     const nameInput = document.querySelector('[name="user-name"]');
    //     const textInput = document.querySelector('[name="user-comment"]');
    //     postComment(nameInput, textInput);
    // });


    const commentAddTreeButtons = document.querySelectorAll('.add-comment-button');
    const commentAddBlock = document.querySelector('.comment-create').cloneNode(true);


    const formCallEventListener = () => {
        commentAddTreeButtons.forEach((button) => {
            button.addEventListener('click', (event) => {

                const treeWrapper = event.target.closest('.comment-wrap');
                document.querySelectorAll('.comment-wrap').forEach((element) => {
                    if (element.getAttribute('data-id-g') !== treeWrapper.getAttribute('data-id-g')) {
                        element.querySelector('.comment-create') ? element.querySelector('.comment-create').remove() : "";
                    }
                })
                if (treeWrapper.querySelector('.comment-create')) {
                    treeWrapper.querySelector('.comment-create').remove();
                } else {
                    treeWrapper.insertAdjacentHTML('beforeend', commentAddBlock.outerHTML);

                    const newCommentBlock = treeWrapper.querySelector('.comment-create');


                    document.querySelectorAll(".user-picture-to-load").forEach(img => {
                        userImageDataUrl ? img.setAttribute('src', userImageDataUrl) : img.setAttribute('src', 'images/profile.svg');
                    })
                    const imageInputs = document.querySelectorAll('.image-input');
                    imageInputEventListener(imageInputs);
                    const wrapper = treeWrapper.closest('.comments-wrap');
                    const wrapperId = wrapper.getAttribute('data-comment-block-id');
                    newCommentBlock.querySelector('[name="user-comment"]').addEventListener('keypress', (event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            postComment(
                                newCommentBlock.querySelector('[name="user-name"]'),
                                newCommentBlock.querySelector('[name="user-comment"]'),
                                true,
                                treeWrapper.getAttribute('data-id-g'),
                                wrapper,
                                wrapperId
                            );

                        }
                    });

                    newCommentBlock.querySelector('.comment-create__create-btn').addEventListener('click', () => {
                        postComment(
                            newCommentBlock.querySelector('[name="user-name"]'),
                            newCommentBlock.querySelector('[name="user-comment"]'),
                            true,
                            treeWrapper.getAttribute('data-id-g'),
                            wrapper,
                            wrapperId
                        );
                    });
                }

            });
        })
    }

    formCallEventListener();


    $('.close-comment-popup').on('click', function () {
        $('body').css('overflow', 'visible');
        $('#openModal').css('marginLeft', '0px');
        $('#openModal').removeClass('open');
    });
    $('.popup-com-btn').on('click', function () {
        if ($('.comment__modal__form').valid) {
            $('body').css('overflow', 'visible');
            $('#openModal').css('marginLeft', '0px');
            $('#openModal').removeClass('open');
        }
    });

})





const modalImage = document.querySelector('.modal__cropped-image');
const modalWrap = document.querySelector('.modal-wrap');
const modalWrapActive = document.querySelector('.modal-wrap.active');
const modalContent = document.querySelector('.modal');
const cropImages = document.querySelectorAll('.comment__img');
const closeButton = document.querySelector('.modal__close');

cropImages.forEach(image => {
    image.addEventListener('click',(event)=> {
        const imageSrc = image.getAttribute('src');
        modalWrap.classList.add('active');
        modalImage.setAttribute('src', imageSrc);
        modalWrap.addEventListener('click', (event) => {
            if (event.target == closeButton || event.target === modalWrap && event.target !== modalContent) {
                modalWrap.classList.remove('active');
            }
        })
    })
})










// ====================================LIVE-EMOJI
let randomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


let emojiCountersData = JSON.parse(localStorage.getItem('emojiCounters') || '[]');


const setStorageEmoji = (item, name) => {
    const itemSelector = item.querySelector(name).classList;
    if (!itemSelector.contains('active')) {
        itemSelector.add('active');
    }
}

document.querySelectorAll('.emoji-box.active').forEach(item => {
    emojiCountersData.forEach(storageItem => {
        const likesIdValue = item.getAttribute('emoji-id');

        if (likesIdValue === storageItem.id) {
            item.querySelector('.like-count').innerHTML = storageItem.count;
            if (storageItem.count < 5) {
                setStorageEmoji(item, '.like-ico');
            } else {
                setStorageEmoji(item, '.like-ico');
                setStorageEmoji(item, '.heart-ico');
                setStorageEmoji(item, '.wow-ico');
            }
        }
    })
})


const emojiCounterInc = (item, counterValue) => {
    return item.querySelector('.like-count').innerHTML = parseInt(counterValue + 1);
}

const targetEmoji = (item, name) => {
    const emojiSelector = item.querySelector(name).classList;
    const emojies = item.querySelectorAll('.emoji-box__ico');
    let count = 0;
    emojies.forEach((el) => {
        el.classList.contains('active') ? count++ : '';
    })
    if (count < 3) {
        if (emojiSelector.contains('active')) {
            emojiSelector.remove('active');
            setTimeout(() => {
                emojiSelector.add('active');
            }, 100);
        } else
            emojiSelector.add('active');
    } else {
        if (emojiSelector.contains('active')) {
            emojiSelector.remove('active');
            setTimeout(() => {
                emojiSelector.add('active');
            }, 100);
        }
    }

}

const addUserReaction = (item, name, counterValue, emojiId)=> {
    targetEmoji(item, name);
    const likeCountWrap = item.querySelector('.like-count-wrap');
    const likeCount = likeCountWrap.querySelector('.like-count');
    likeCountWrap.innerHTML = `You and ${likeCount.outerHTML} other`;
}


const emojiAdd = (item, name, counterValue, emojiId) => {
    targetEmoji(item, name);
    emojiCounterInc(item, counterValue);

    const comment = {
        id: emojiId,
        count: counterValue
    };

    const found = emojiCountersData.some(function (el) {
        return el.id === emojiId;
    });

    if (found) {
        emojiCountersData.forEach(function(item){
            if (item.id === emojiId) {
                item.count = counterValue;
                localStorage.setItem('emojiCounters', JSON.stringify(emojiCountersData));
            }
        })
    } else {
        emojiCountersData.push(comment);
        localStorage.setItem('emojiCounters', JSON.stringify(emojiCountersData));
    }
}

let ticker = true;
const tickerReset = () => {
    setTimeout( () => {
        ticker = true;
    }, 10000);
};

$('.emoji-box.active').on('inview', (event, isInView) => {
    const emojiId = event.target.getAttribute('emoji-id');
    let counterValue = parseInt(event.target.querySelector('.like-count').innerHTML);
    if (!counterValue) {
        counterValue = 0;
    }
    if (isInView && ticker) {
        const randomTicker = randomInt(550, 2555);
        let randomEmoji = randomInt(1, 6);
        setTimeout(() => {
            event.target.classList.contains('hide') ? event.target.classList.remove('hide') : '';
            switch (randomEmoji) {
                case 1:
                    emojiAdd(event.target, '.like-ico', counterValue, emojiId);
                    break;
                case 2:
                    emojiAdd(event.target, '.heart-ico', counterValue, emojiId);
                    break;
                case 3:
                    emojiAdd(event.target, '.wow-ico', counterValue, emojiId);
                    break;
                case 4:
                    emojiAdd(event.target, '.haha-ico', counterValue, emojiId);
                    break;
                case 5:
                    emojiAdd(event.target, '.sad-ico', counterValue, emojiId);
                    break;
                case 6:
                    emojiAdd(event.target, '.angry-ico', counterValue, emojiId);
                    break;
                default:
                    break;
            }
            ticker = false;
            tickerReset();
        }, randomTicker);
    }
});

const postLikes = document.querySelectorAll('.post-footer');


postLikes.forEach((item, index) => {
    const emojiBox = document.querySelectorAll('.emoji-box')[index];
    const emojiId = emojiBox.getAttribute('emoji-id');
    let counterValue = parseInt(document.querySelectorAll('.like-count')[index].innerHTML);
    item.addEventListener("click", (wrapEvent)=> {
        const postLike = item.querySelector('.post-like');
        wrapEvent.target == postLike ? item.querySelector(".emoji-popup").classList.add('active') : item.querySelector(".emoji-popup").classList.remove('active');
        // wrapEvent.target === item ? item.querySelector(".emoji-popup").classList.add('active') : item.querySelector(".emoji-popup").classList.remove('active');
        item.querySelectorAll('.emoji-popup__ico').forEach((emoji, index) => {
            emoji.addEventListener("click", (ev)=> {
                postLike.classList.remove('active');
                postLike.classList.add('active');
                item.querySelector(".emoji-popup").classList.remove('active');
                switch (index + 1) {
                    case 1:
                        addUserReaction(emojiBox, '.like-ico', counterValue, emojiId);
                        break;
                    case 2:
                        addUserReaction(emojiBox, '.heart-ico', counterValue, emojiId);
                        break;
                    case 3:
                        addUserReaction(emojiBox, '.wow-ico', counterValue, emojiId);
                        break;
                    case 4:
                        addUserReaction(emojiBox, '.haha-ico', counterValue, emojiId);
                        break;
                    case 5:
                        addUserReaction(emojiBox, '.sad-ico', counterValue, emojiId);
                        break;
                    case 6:
                        addUserReaction(emojiBox, '.angry-ico', counterValue, emojiId);
                        break;
                    default:
                        break;
                }

            })
        })
    })
})


const commentsWrapper = document.querySelector('.comments-wrap');

const commentLikeBtns = document.querySelectorAll('.like-btn');

commentLikeBtns.forEach((item)=> {
    item.addEventListener("click", ()=> {

        let commentLikes = item.closest('.comment').querySelector(".comment-likes").innerHTML;
        if (item.classList.contains('active')) {
            item.classList.remove('active');
            item.closest('.comment').querySelector(".comment-likes").innerHTML = Number(commentLikes) - 1;
        }else {
            item.classList.add('active');
            item.closest('.comment').querySelector(".comment-likes").innerHTML = Number(commentLikes) + 1;
        }
    })
})


const showFormBtn = document.querySelector('.post-comment');


showFormBtn.addEventListener("click", ()=> {
    commentsWrapper.classList.toggle('show-form');
})

const commentsCounters = document.querySelectorAll('.comments-count');



setTimeout(() => {
    const innerComments = commentsWrapper.querySelectorAll('.comment');
    commentsCounters.forEach(item => {
        item.innerHTML = innerComments.length;
    })
}, 200);

const shareButton = document.querySelector('.share-btn');


shareButton.href = `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`;
